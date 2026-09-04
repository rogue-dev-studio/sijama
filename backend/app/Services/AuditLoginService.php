<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 13:36:09
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 13:36:09
 */

namespace App\Services;

use App\Models\AuditLogin;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class AuditLoginService
{
    public const EVENT_LOGIN = 'login';

    public const EVENT_LOGOUT = 'logout';

    public const REASON_INVALID_CREDENTIALS = 'invalid_credentials';

    public const REASON_USER_NOT_FOUND = 'user_not_found';

    public const REASON_INACTIVE = 'inactive';

    public const REASON_MAINTENANCE = 'maintenance';

    /**
     * @param  array{
     *   event?: string,
     *   success: bool,
     *   username: string,
     *   user_id?: int|null,
     *   failure_reason?: string|null,
     *   remember_me?: bool|null,
     *   personal_access_token_id?: int|null
     * }  $payload
     */
    public function record(array $payload, ?Request $request = null): void
    {
        try {
            AuditLogin::query()->create([
                'event' => $payload['event'] ?? self::EVENT_LOGIN,
                'success' => (bool) $payload['success'],
                'username' => Str::limit(trim((string) $payload['username']), 255, ''),
                'user_id' => $payload['user_id'] ?? null,
                'failure_reason' => $payload['failure_reason'] ?? null,
                'ip_address' => $request?->ip(),
                'user_agent' => Str::limit((string) ($request?->userAgent() ?? ''), 512, ''),
                'remember_me' => array_key_exists('remember_me', $payload)
                    ? $payload['remember_me']
                    : ($request?->boolean('remember_me')),
                'device_key' => Str::limit((string) ($request?->header('X-Device-Key') ?? ''), 128, '') ?: null,
                'personal_access_token_id' => $payload['personal_access_token_id'] ?? null,
                'attempted_at' => now(),
            ]);
        } catch (Throwable $exception) {
            Log::warning('Gagal mencatat audit login.', [
                'message' => $exception->getMessage(),
            ]);
        }
    }

    public function recordLogout(User $user, ?Request $request = null): void
    {
        $tokenId = null;
        $token = $user->currentAccessToken();
        if ($token && isset($token->id)) {
            $tokenId = (int) $token->id;
        }

        $this->record([
            'event' => self::EVENT_LOGOUT,
            'success' => true,
            'username' => (string) ($user->username ?: $user->email ?: $user->id),
            'user_id' => $user->id,
            'personal_access_token_id' => $tokenId,
            'remember_me' => null,
        ], $request);
    }

    public function list(
        ?string $q,
        ?string $event,
        ?bool $success,
        ?string $dateFrom,
        ?string $dateTo,
        ?int $perPage,
        ?int $page,
        ?string $sortBy,
        ?string $sortDir,
    ): LengthAwarePaginator {
        $builder = AuditLogin::query()->with(['user:id,name,username']);

        if (filled($q)) {
            $term = '%'.trim((string) $q).'%';
            $builder->where(function ($query) use ($term) {
                $query->where('username', 'ilike', $term)
                    ->orWhere('ip_address', 'ilike', $term)
                    ->orWhere('failure_reason', 'ilike', $term)
                    ->orWhereHas('user', function ($userQuery) use ($term) {
                        $userQuery->where('name', 'ilike', $term)
                            ->orWhere('username', 'ilike', $term);
                    });
            });
        }

        if (filled($event) && in_array($event, [self::EVENT_LOGIN, self::EVENT_LOGOUT], true)) {
            $builder->where('event', $event);
        }

        if ($success !== null) {
            $builder->where('success', $success);
        }

        if (filled($dateFrom)) {
            $builder->whereDate('attempted_at', '>=', $dateFrom);
        }

        if (filled($dateTo)) {
            $builder->whereDate('attempted_at', '<=', $dateTo);
        }

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            [
                'attempted_at' => 'attempted_at',
                'username' => 'username',
                'event' => 'event',
                'success' => 'success',
                'ip_address' => 'ip_address',
            ],
            'attempted_at',
            'desc',
        );

        return PaginationHelper::paginate($builder, $perPage, $page);
    }
}
