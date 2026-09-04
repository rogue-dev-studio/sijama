<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 14:10:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 14:10:53
 */

namespace App\Services;

use App\Models\AuditActivity;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class AuditActivityService
{
    public const MODULE_ACCESS = 'access';

    public const MODULE_KONFIG = 'konfig';

    public const MODULE_JAMAAH = 'jamaah';

    public const MODULES = [
        self::MODULE_ACCESS,
        self::MODULE_KONFIG,
        self::MODULE_JAMAAH,
    ];

    /** @var list<string> */
    private const SECRET_KEYS = [
        'password',
        'smtp_password',
        'fonnte_token',
        'telegram_bot_token',
        'api_key',
        'api_co_id_api_key',
        'face_descriptor',
        'token',
        'secret',
    ];

    /**
     * @param  array{
     *   module: string,
     *   action: string,
     *   entity_type: string,
     *   entity_id?: int|null,
     *   entity_label?: string|null,
     *   summary: string,
     *   meta?: array<string, mixed>|null,
     *   actor?: User|null
     * }  $payload
     */
    public function record(array $payload, ?Request $request = null): void
    {
        try {
            $actor = $payload['actor'] ?? Auth::user();
            $request ??= request();
            if (! $request instanceof Request) {
                $request = null;
            }

            $meta = $payload['meta'] ?? null;
            $metaJson = null;
            if (is_array($meta) && $meta !== []) {
                $metaJson = json_encode(
                    $this->maskSecrets($meta),
                    JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
                ) ?: null;
                $metaJson = $metaJson ? Str::limit($metaJson, 20000, '') : null;
            }

            AuditActivity::query()->create([
                'module' => $payload['module'],
                'action' => Str::limit($payload['action'], 64, ''),
                'entity_type' => Str::limit($payload['entity_type'], 64, ''),
                'entity_id' => $payload['entity_id'] ?? null,
                'entity_label' => isset($payload['entity_label'])
                    ? Str::limit((string) $payload['entity_label'], 255, '')
                    : null,
                'actor_user_id' => $actor instanceof User ? $actor->id : null,
                'actor_username' => $actor instanceof User
                    ? Str::limit((string) ($actor->username ?: $actor->email ?: $actor->id), 255, '')
                    : null,
                'summary' => Str::limit(trim((string) $payload['summary']), 2000, ''),
                'meta' => $metaJson,
                'ip_address' => $request?->ip(),
                'user_agent' => Str::limit((string) ($request?->userAgent() ?? ''), 512, '') ?: null,
                'occurred_at' => now(),
            ]);
        } catch (Throwable $exception) {
            Log::warning('Gagal mencatat audit aktivitas.', [
                'message' => $exception->getMessage(),
            ]);
        }
    }

    public function list(
        string $module,
        ?string $q,
        ?string $action,
        ?string $dateFrom,
        ?string $dateTo,
        ?int $perPage,
        ?int $page,
        ?string $sortBy,
        ?string $sortDir,
    ): LengthAwarePaginator {
        $builder = AuditActivity::query()
            ->with(['actor:id,name,username'])
            ->where('module', $module);

        if (filled($q)) {
            $term = '%'.trim((string) $q).'%';
            $builder->where(function ($query) use ($term) {
                $query->where('summary', 'ilike', $term)
                    ->orWhere('entity_label', 'ilike', $term)
                    ->orWhere('actor_username', 'ilike', $term)
                    ->orWhere('action', 'ilike', $term)
                    ->orWhere('entity_type', 'ilike', $term);
            });
        }

        if (filled($action)) {
            $builder->where('action', $action);
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
                'action' => 'action',
                'entity_label' => 'entity_label',
                'actor_username' => 'actor_username',
            ],
            'occurred_at',
            'desc',
        );

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function find(string $module, int $id): ?AuditActivity
    {
        return AuditActivity::query()
            ->with(['actor:id,name,username'])
            ->where('module', $module)
            ->find($id);
    }

    /**
     * @param  array<string, mixed>  $before
     * @param  array<string, mixed>  $after
     * @return array{changed: list<string>, before: array<string, mixed>, after: array<string, mixed>}
     */
    public function diff(array $before, array $after): array
    {
        $keys = array_values(array_unique([...array_keys($before), ...array_keys($after)]));
        $changed = [];
        $beforeOut = [];
        $afterOut = [];

        foreach ($keys as $key) {
            $b = $before[$key] ?? null;
            $a = $after[$key] ?? null;
            if ($this->normalizeComparable($b) === $this->normalizeComparable($a)) {
                continue;
            }
            $changed[] = (string) $key;
            $beforeOut[$key] = $b;
            $afterOut[$key] = $a;
        }

        return [
            'changed' => $changed,
            'before' => $beforeOut,
            'after' => $afterOut,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function maskSecrets(array $data): array
    {
        $out = [];
        foreach ($data as $key => $value) {
            $keyStr = (string) $key;
            if ($this->isSecretKey($keyStr)) {
                $out[$keyStr] = $value === null || $value === '' ? null : '[redacted]';
                continue;
            }
            if (is_array($value)) {
                $out[$keyStr] = $this->maskSecrets($value);
                continue;
            }
            $out[$keyStr] = $value;
        }

        return $out;
    }

    private function isSecretKey(string $key): bool
    {
        $lower = strtolower($key);
        foreach (self::SECRET_KEYS as $secret) {
            if ($lower === $secret || str_contains($lower, $secret)) {
                return true;
            }
        }

        return false;
    }

    private function normalizeComparable(mixed $value): string
    {
        if (is_bool($value)) {
            return $value ? '1' : '0';
        }
        if (is_array($value)) {
            return json_encode($value) ?: '';
        }
        if ($value === null) {
            return '';
        }

        return (string) $value;
    }
}
