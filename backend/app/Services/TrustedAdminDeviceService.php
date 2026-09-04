<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:05:00
 */

namespace App\Services;

use App\Models\TrustedAdminDevice;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class TrustedAdminDeviceService
{
    public function remember(User $user, ?Request $request = null, ?string $deviceKey = null): void
    {
        if (! $user->isSuperAdmin() || ! Schema::hasTable('trusted_admin_device_r')) {
            return;
        }

        $key = $this->normalizeDeviceKey($deviceKey);
        if ($key === null) {
            return;
        }

        $existing = TrustedAdminDevice::query()
            ->where('user_id', $user->id)
            ->where('device_key', $key)
            ->first();

        if ($existing?->last_seen_at?->gte(now()->subMinutes(15))) {
            return;
        }

        TrustedAdminDevice::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'device_key' => $key,
            ],
            [
                'ip_address' => $request?->ip(),
                'user_agent' => Str::limit($request?->userAgent() ?? '', 512),
                'last_seen_at' => now(),
            ],
        );
    }

    public function isAllowed(?Request $request = null, ?string $deviceKey = null): bool
    {
        if (! Schema::hasTable('trusted_admin_device_r')) {
            return false;
        }

        $key = $this->normalizeDeviceKey($deviceKey);
        $ip = $request?->ip();

        if ($key === null && (! is_string($ip) || $ip === '')) {
            return false;
        }

        return TrustedAdminDevice::query()
            ->where('last_seen_at', '>=', now()->subDays(180))
            ->where(function ($builder) use ($key, $ip) {
                if ($key !== null) {
                    $builder->orWhere('device_key', $key);
                }

                if (is_string($ip) && $ip !== '') {
                    $builder->orWhere('ip_address', $ip);
                }
            })
            ->exists();
    }

    private function normalizeDeviceKey(?string $deviceKey): ?string
    {
        $key = trim((string) $deviceKey);

        if ($key === '' || $key === 'anonymous' || strlen($key) > 64) {
            return null;
        }

        if (! preg_match('/^[A-Za-z0-9._:-]+$/', $key)) {
            return null;
        }

        return $key;
    }
}
