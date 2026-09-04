<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 04:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 04:15:00
 */

namespace App\Support;

final class MediaPathGuard
{
    /** @var list<string> */
    public const PUBLIC_PREFIXES = [
        'jamaah/',
        'konfig/',
    ];

    /** @var list<string> */
    public const AUTHENTICATED_PREFIXES = [
        'users/',
    ];

    /** @var list<string> */
    public const SIGNED_PREFIXES = [
        'share/',
    ];

    public static function normalize(string $path): string
    {
        $path = ltrim($path, '/');

        if ($path === '' || str_contains($path, '..')) {
            abort(404);
        }

        return $path;
    }

    public static function matchesPrefix(string $path, array $prefixes): bool
    {
        foreach ($prefixes as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return true;
            }
        }

        return false;
    }

    public static function assertPublicAllowed(string $path): void
    {
        if (! self::matchesPrefix($path, self::PUBLIC_PREFIXES)) {
            abort(404);
        }
    }

    public static function assertAuthenticatedAllowed(string $path): void
    {
        if (! self::matchesPrefix($path, self::AUTHENTICATED_PREFIXES)) {
            abort(404);
        }
    }

    public static function assertSignedAllowed(string $path): void
    {
        if (! self::matchesPrefix($path, self::SIGNED_PREFIXES)) {
            abort(404);
        }
    }
}
