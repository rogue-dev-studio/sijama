<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 13:35:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 13:40:00
 */

namespace App\Support;

use DateTimeInterface;

class LoginRememberOptions
{
    public const MIN_MINUTES = 1;

    public const MAX_MINUTES = 525_600;

    public const DEFAULT_MINUTES = 1440;

    public static function isAllowed(?int $minutes): bool
    {
        if ($minutes === null) {
            return true;
        }

        return $minutes >= self::MIN_MINUTES && $minutes <= self::MAX_MINUTES;
    }

    public static function resolveExpiration(?int $minutes): ?DateTimeInterface
    {
        return $minutes ? now()->addMinutes($minutes) : null;
    }

    public static function profileMinutes(?int $storedMinutes): ?int
    {
        return $storedMinutes;
    }

    public static function resolveLoginExpiration(
        ?int $profileMinutes,
        bool $profileUntilLogout,
        bool $rememberMe,
    ): ?DateTimeInterface {
        if (! $rememberMe) {
            return null;
        }

        if ($profileUntilLogout) {
            return null;
        }

        $minutes = self::profileMinutes($profileMinutes) ?? self::DEFAULT_MINUTES;

        return self::resolveExpiration($minutes);
    }
}
