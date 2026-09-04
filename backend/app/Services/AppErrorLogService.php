<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 13:52:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:46:40
 */

namespace App\Services;

use App\Models\AppErrorLog;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;
use Throwable;

class AppErrorLogService
{
    public const LEVEL_ERROR = 'error';

    public const LEVEL_CRITICAL = 'critical';

    public const STATUS_BARU = 'baru';

    public const STATUS_DALAM_PERBAIKAN = 'dalam_perbaikan';

    public const STATUS_SELESAI = 'selesai';

    public const STATUS_DIABAIKAN = 'diabaikan';

    public const STATUSES = [
        self::STATUS_BARU,
        self::STATUS_DALAM_PERBAIKAN,
        self::STATUS_SELESAI,
        self::STATUS_DIABAIKAN,
    ];

    public const STATUS_LABELS = [
        self::STATUS_BARU => 'Baru',
        self::STATUS_DALAM_PERBAIKAN => 'Dalam perbaikan',
        self::STATUS_SELESAI => 'Selesai',
        self::STATUS_DIABAIKAN => 'Diabaikan',
    ];

    /**
     * @var list<class-string>
     */
    public const IGNORED_EXCEPTIONS = [
        ValidationException::class,
        AuthenticationException::class,
        AccessDeniedHttpException::class,
        NotFoundHttpException::class,
        ModelNotFoundException::class,
        ServiceUnavailableHttpException::class,
    ];

    public function shouldRecord(Throwable $exception): bool
    {
        foreach (self::IGNORED_EXCEPTIONS as $ignored) {
            if ($exception instanceof $ignored) {
                return false;
            }
        }

        if ($exception instanceof HttpExceptionInterface) {
            $status = $exception->getStatusCode();
            if ($status >= 400 && $status < 500) {
                return false;
            }
        }

        return true;
    }

    public function recordFromException(Throwable $exception, ?Request $request = null): void
    {
        if (! $this->shouldRecord($exception)) {
            return;
        }

        $request ??= request();
        if (! $request instanceof Request) {
            $request = null;
        }

        $level = $exception instanceof \Error ? self::LEVEL_CRITICAL : self::LEVEL_ERROR;
        $userId = null;
        try {
            $user = Auth::user();
            $userId = $user?->id;
        } catch (Throwable) {
            $userId = null;
        }

        try {
            AppErrorLog::query()->create([
                'level' => $level,
                'status' => self::STATUS_BARU,
                'exception_class' => Str::limit($exception::class, 255, ''),
                'message' => Str::limit($exception->getMessage() !== '' ? $exception->getMessage() : $exception::class, 4000, ''),
                'file' => Str::limit((string) $exception->getFile(), 512, '') ?: null,
                'line' => $exception->getLine() ?: null,
                'stack_trace' => Str::limit($exception->getTraceAsString(), 20000, "\n…"),
                'request_method' => $request?->method(),
                'request_path' => Str::limit((string) ($request?->path() ?? ''), 512, '') ?: null,
                'user_id' => $userId,
                'ip_address' => $request?->ip(),
                'user_agent' => Str::limit((string) ($request?->userAgent() ?? ''), 512, '') ?: null,
                'occurred_at' => now(),
            ]);
        } catch (Throwable $writeError) {
            Log::warning('Gagal mencatat app error log.', [
                'message' => $writeError->getMessage(),
            ]);
        }
    }

    public function list(
        ?string $q,
        ?string $level,
        ?string $status,
        ?string $dateFrom,
        ?string $dateTo,
        ?int $perPage,
        ?int $page,
        ?string $sortBy,
        ?string $sortDir,
    ): LengthAwarePaginator {
        $builder = AppErrorLog::query()->with([
            'user:id,name,username',
            'statusUpdatedBy:id,name,username',
        ]);

        if (filled($q)) {
            $term = '%'.trim((string) $q).'%';
            $builder->where(function ($query) use ($term) {
                $query->where('message', 'ilike', $term)
                    ->orWhere('exception_class', 'ilike', $term)
                    ->orWhere('request_path', 'ilike', $term)
                    ->orWhere('file', 'ilike', $term)
                    ->orWhereHas('user', function ($userQuery) use ($term) {
                        $userQuery->where('name', 'ilike', $term)
                            ->orWhere('username', 'ilike', $term);
                    });
            });
        }

        if (filled($level) && in_array($level, [self::LEVEL_ERROR, self::LEVEL_CRITICAL], true)) {
            $builder->where('level', $level);
        }

        if (filled($status) && in_array($status, self::STATUSES, true)) {
            $builder->where('status', $status);
        }

        if (filled($dateFrom)) {
            $builder->whereDate('occurred_at', '>=', $dateFrom);
        }

        if (filled($dateTo)) {
            $builder->whereDate('occurred_at', '<=', $dateTo);
        }

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            [
                'occurred_at' => 'occurred_at',
                'level' => 'level',
                'status' => 'status',
                'exception_class' => 'exception_class',
                'request_path' => 'request_path',
            ],
            'occurred_at',
            'desc',
        );

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function find(int $id): ?AppErrorLog
    {
        return AppErrorLog::query()
            ->with(['user:id,name,username', 'statusUpdatedBy:id,name,username'])
            ->find($id);
    }

    /**
     * @param  array{status: string, status_note?: string|null}  $data
     */
    public function updateStatus(int $id, array $data, User $actor): AppErrorLog
    {
        $log = AppErrorLog::query()->find($id);
        if (! $log) {
            throw new ModelNotFoundException('Log error tidak ditemukan.');
        }

        $status = (string) $data['status'];
        if (! in_array($status, self::STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => ['Status tidak valid.'],
            ]);
        }

        $log->status = $status;
        $log->status_note = array_key_exists('status_note', $data)
            ? (filled($data['status_note']) ? trim((string) $data['status_note']) : null)
            : $log->status_note;
        $log->status_updated_at = now();
        $log->status_updated_by = $actor->id;
        $log->save();

        return $log->load(['user:id,name,username', 'statusUpdatedBy:id,name,username']);
    }

    public function clear(?string $level = null, ?string $status = null, ?string $dateFrom = null, ?string $dateTo = null): int
    {
        $builder = AppErrorLog::query();

        if (filled($level) && in_array($level, [self::LEVEL_ERROR, self::LEVEL_CRITICAL], true)) {
            $builder->where('level', $level);
        }

        if (filled($status) && in_array($status, self::STATUSES, true)) {
            $builder->where('status', $status);
        }

        if (filled($dateFrom)) {
            $builder->whereDate('occurred_at', '>=', $dateFrom);
        }

        if (filled($dateTo)) {
            $builder->whereDate('occurred_at', '<=', $dateTo);
        }

        return $builder->delete();
    }
}
