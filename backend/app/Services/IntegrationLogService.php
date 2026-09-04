<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 15:51:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 15:51:00
 */

namespace App\Services;

use App\Models\IntegrationLog;
use App\Models\KonfigSystemK;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class IntegrationLogService
{
    public const PROVIDERS = ['database', 'smtp', 'fonnte', 'telegram', 'n8n', 'api_co_id'];

    public const PROVIDER_PERMISSIONS = [
        'database' => 'integration_log_database.view',
        'smtp' => 'integration_log_smtp.view',
        'fonnte' => 'integration_log_fonnte.view',
        'telegram' => 'integration_log_telegram.view',
        'n8n' => 'integration_log_n8n.view',
        'api_co_id' => 'integration_log_api_co_id.view',
    ];

    public const PROVIDER_LABELS = [
        'database' => 'Database',
        'smtp' => 'SMTP / Email',
        'fonnte' => 'Fonnte',
        'telegram' => 'Telegram',
        'n8n' => 'n8n',
        'api_co_id' => 'api.co.id',
    ];

    public const LEVELS = ['info', 'warning', 'error', 'critical'];

    public const EVENT_TYPES = [
        'expiry_warning',
        'expiry_expired',
        'maintenance',
        'connectivity_ok',
        'connectivity_error',
        'sync_ok',
        'sync_failed',
        'config_note',
        'other',
    ];

    public const EXPIRY_WARN_DAYS = 14;

    /**
     * @param  array<string, mixed>|null  $context
     */
    public function record(
        string $provider,
        string $level,
        string $eventType,
        string $title,
        string $message,
        ?array $context = null,
        ?int $createdBy = null,
    ): IntegrationLog {
        $this->assertProvider($provider);
        $this->assertLevel($level);
        $this->assertEventType($eventType);

        return IntegrationLog::query()->create([
            'provider' => $provider,
            'level' => $level,
            'event_type' => $eventType,
            'title' => $title,
            'message' => $message,
            'context_json' => $context === null ? null : json_encode($context, JSON_UNESCAPED_UNICODE),
            'occurred_at' => now(),
            'created_by' => $createdBy ?? Auth::id(),
        ]);
    }

    public function list(
        ?string $query = null,
        ?string $provider = null,
        ?string $level = null,
        ?string $eventType = null,
        ?string $dateFrom = null,
        ?string $dateTo = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = IntegrationLog::query()->with(['creator:id,name,username']);

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['occurred_at', 'provider', 'level', 'event_type', 'title'],
            'occurred_at',
            'desc',
        );

        if (filled($provider)) {
            $builder->where('provider', $provider);
        }

        if (filled($level)) {
            $builder->where('level', $level);
        }

        if (filled($eventType)) {
            $builder->where('event_type', $eventType);
        }

        if (filled($dateFrom)) {
            $builder->whereDate('occurred_at', '>=', $dateFrom);
        }

        if (filled($dateTo)) {
            $builder->whereDate('occurred_at', '<=', $dateTo);
        }

        if (filled($query)) {
            $builder->where(function ($q) use ($query) {
                $q->where('title', 'ilike', "%{$query}%")
                    ->orWhere('message', 'ilike', "%{$query}%");
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function find(int $id): IntegrationLog
    {
        $row = IntegrationLog::query()->with(['creator:id,name,username'])->find($id);
        if (! $row) {
            throw new ModelNotFoundException('Log integrasi tidak ditemukan.');
        }

        return $row;
    }

    /**
     * @return array{recorded: int, checks: list<array<string, mixed>>}
     */
    public function runExpirySweep(?KonfigSystemK $konfig = null): array
    {
        $konfig ??= app(KonfigSystemKService::class)->resolveModel();
        $recorded = 0;
        $checks = [];

        foreach ($this->validityMap($konfig) as $provider => $validUntil) {
            $result = $this->evaluateExpiry($provider, $validUntil);
            $checks[] = $result;
            if ($result['should_log'] ?? false) {
                $this->record(
                    $provider,
                    $result['level'],
                    $result['event_type'],
                    $result['title'],
                    $result['message'],
                    ['valid_until' => $validUntil, 'days_left' => $result['days_left']],
                );
                $recorded++;
            }
        }

        return ['recorded' => $recorded, 'checks' => $checks];
    }

    /**
     * @return array{ok: bool, status: string, message: string, log_id: int|null}
     */
    public function checkConnectivity(string $provider, ?KonfigSystemK $konfig = null): array
    {
        $this->assertProvider($provider);
        $konfig ??= app(KonfigSystemKService::class)->resolveModel();

        $result = match ($provider) {
            'database' => $this->checkDatabase($konfig),
            'smtp' => $this->checkSmtp($konfig),
            'fonnte' => $this->checkHttpEndpoint($konfig->fonnte_endpoint, 'Fonnte'),
            'telegram' => $this->checkTelegram($konfig),
            'n8n' => $this->checkHttpEndpoint($konfig->n8n_base_url ?: $konfig->n8n_webhook_url, 'n8n'),
            'api_co_id' => $this->checkHttpEndpoint($konfig->api_co_id_holiday_base_url, 'api.co.id'),
            default => ['ok' => false, 'status' => 'error', 'message' => 'Provider tidak dikenal.'],
        };

        $log = $this->record(
            $provider,
            $result['ok'] ? 'info' : 'error',
            $result['ok'] ? 'connectivity_ok' : 'connectivity_error',
            $result['ok'] ? 'Koneksi OK' : 'Gangguan koneksi',
            $result['message'],
            ['status' => $result['status']],
        );

        if ($provider === 'database' && Schema::hasColumn('konfigsystem_k', 'db_last_checked_at')) {
            $konfig->forceFill([
                'db_last_checked_at' => now(),
                'db_last_check_status' => $result['status'],
                'db_last_check_message' => $result['message'],
                'last_modified_date' => now(),
            ])->save();
        }

        return [
            'ok' => $result['ok'],
            'status' => $result['status'],
            'message' => $result['message'],
            'log_id' => $log->id,
        ];
    }

    /**
     * @return array{provider: string, valid_until: string|null, days_left: int|null, level: string, event_type: string, title: string, message: string, should_log: bool}
     */
    private function evaluateExpiry(string $provider, ?string $validUntil): array
    {
        if (! filled($validUntil)) {
            return [
                'provider' => $provider,
                'valid_until' => null,
                'days_left' => null,
                'level' => 'info',
                'event_type' => 'other',
                'title' => 'Masa berlaku belum diisi',
                'message' => 'Belum ada tanggal masa berlaku untuk '.$provider.'.',
                'should_log' => false,
            ];
        }

        $daysLeft = (int) now()->startOfDay()->diffInDays(Carbon::parse($validUntil)->startOfDay(), false);

        if ($daysLeft < 0) {
            return [
                'provider' => $provider,
                'valid_until' => $validUntil,
                'days_left' => $daysLeft,
                'level' => 'critical',
                'event_type' => 'expiry_expired',
                'title' => 'Masa berlaku habis',
                'message' => 'Integrasi '.$provider.' sudah lewat masa berlaku ('.$validUntil.').',
                'should_log' => ! $this->hasRecentEvent($provider, 'expiry_expired', 1),
            ];
        }

        if ($daysLeft <= self::EXPIRY_WARN_DAYS) {
            return [
                'provider' => $provider,
                'valid_until' => $validUntil,
                'days_left' => $daysLeft,
                'level' => 'warning',
                'event_type' => 'expiry_warning',
                'title' => 'Masa berlaku hampir habis',
                'message' => 'Integrasi '.$provider.' berakhir dalam '.$daysLeft.' hari ('.$validUntil.').',
                'should_log' => ! $this->hasRecentEvent($provider, 'expiry_warning', 1),
            ];
        }

        return [
            'provider' => $provider,
            'valid_until' => $validUntil,
            'days_left' => $daysLeft,
            'level' => 'info',
            'event_type' => 'other',
            'title' => 'Masa berlaku aman',
            'message' => 'Sisa '.$daysLeft.' hari.',
            'should_log' => false,
        ];
    }

    private function hasRecentEvent(string $provider, string $eventType, int $days): bool
    {
        return IntegrationLog::query()
            ->where('provider', $provider)
            ->where('event_type', $eventType)
            ->where('occurred_at', '>=', now()->subDays($days)->startOfDay())
            ->exists();
    }

    /** @return array<string, string|null> */
    private function validityMap(KonfigSystemK $konfig): array
    {
        return [
            'database' => $konfig->db_valid_until?->format('Y-m-d'),
            'smtp' => $konfig->smtp_valid_until?->format('Y-m-d'),
            'fonnte' => $konfig->fonnte_valid_until?->format('Y-m-d'),
            'telegram' => $konfig->telegram_valid_until?->format('Y-m-d'),
            'n8n' => $konfig->n8n_valid_until?->format('Y-m-d'),
            'api_co_id' => $konfig->api_co_id_valid_until?->format('Y-m-d'),
        ];
    }

    /** @return array{ok: bool, status: string, message: string} */
    private function checkDatabase(KonfigSystemK $konfig): array
    {
        try {
            DB::connection()->getPdo();
            $default = (string) config('database.default');
            $host = (string) config('database.connections.'.$default.'.host');
            $driver = filled($konfig->db_driver)
                ? (string) $konfig->db_driver
                : (string) config('database.connections.'.$default.'.driver', $default);
            $hint = $konfig->db_host ?: $host;
            $label = self::PROVIDER_LABELS['database'];

            return [
                'ok' => true,
                'status' => 'ok',
                'message' => "Koneksi {$label} aktif (driver {$driver}, host {$hint}).",
            ];
        } catch (\Throwable $e) {
            return [
                'ok' => false,
                'status' => 'error',
                'message' => 'Gagal koneksi database: '.$e->getMessage(),
            ];
        }
    }

    /** @return array{ok: bool, status: string, message: string} */
    private function checkSmtp(KonfigSystemK $konfig): array
    {
        $host = trim((string) $konfig->smtp_hostname);
        $port = (int) ($konfig->smtp_port ?: 587);
        if ($host === '') {
            return ['ok' => false, 'status' => 'error', 'message' => 'SMTP hostname belum diisi.'];
        }

        $errno = 0;
        $errstr = '';
        $socket = @fsockopen($host, $port, $errno, $errstr, 5);
        if (! $socket) {
            return [
                'ok' => false,
                'status' => 'error',
                'message' => "Tidak dapat menjangkau SMTP {$host}:{$port} ({$errstr}).",
            ];
        }
        fclose($socket);

        return [
            'ok' => true,
            'status' => 'ok',
            'message' => "Host SMTP {$host}:{$port} dapat dijangkau.",
        ];
    }

    /** @return array{ok: bool, status: string, message: string} */
    private function checkTelegram(KonfigSystemK $konfig): array
    {
        $token = $konfig->decryptedSecret('telegram_bot_token');
        if (! filled($token)) {
            return ['ok' => false, 'status' => 'error', 'message' => 'Token Telegram belum diisi.'];
        }

        try {
            $response = Http::timeout(8)->get('https://api.telegram.org/bot'.$token.'/getMe');
            if (! $response->ok() || ! ($response->json('ok') ?? false)) {
                return [
                    'ok' => false,
                    'status' => 'error',
                    'message' => 'Telegram getMe gagal: HTTP '.$response->status(),
                ];
            }

            $username = $response->json('result.username');

            return [
                'ok' => true,
                'status' => 'ok',
                'message' => 'Bot Telegram aktif'.($username ? ' (@'.$username.')' : '').'.',
            ];
        } catch (\Throwable $e) {
            return [
                'ok' => false,
                'status' => 'error',
                'message' => 'Gagal menghubungi Telegram API: '.$e->getMessage(),
            ];
        }
    }

    /** @return array{ok: bool, status: string, message: string} */
    private function checkHttpEndpoint(?string $url, string $label): array
    {
        $url = trim((string) $url);
        if ($url === '') {
            return ['ok' => false, 'status' => 'error', 'message' => "URL {$label} belum diisi."];
        }

        try {
            $response = Http::timeout(8)->get($url);

            return [
                'ok' => $response->successful() || $response->status() < 500,
                'status' => ($response->successful() || $response->status() < 500) ? 'ok' : 'error',
                'message' => "{$label} merespons HTTP ".$response->status().'.',
            ];
        } catch (\Throwable $e) {
            return [
                'ok' => false,
                'status' => 'error',
                'message' => "Gagal menghubungi {$label}: ".$e->getMessage(),
            ];
        }
    }

    private function assertProvider(string $provider): void
    {
        if (! in_array($provider, self::PROVIDERS, true)) {
            throw ValidationException::withMessages([
                'provider' => ['Provider integrasi tidak valid.'],
            ]);
        }
    }

    private function assertLevel(string $level): void
    {
        if (! in_array($level, self::LEVELS, true)) {
            throw ValidationException::withMessages([
                'level' => ['Level log tidak valid.'],
            ]);
        }
    }

    private function assertEventType(string $eventType): void
    {
        if (! in_array($eventType, self::EVENT_TYPES, true)) {
            throw ValidationException::withMessages([
                'event_type' => ['Tipe event tidak valid.'],
            ]);
        }
    }
}
