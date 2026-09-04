<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 14:37:38
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 14:37:38
 */

namespace App\Support;

final class AppFontPresets
{
    /** @return list<string> */
    public static function ids(): array
    {
        return [
            'fraunces',
            'playfair-display',
            'lora',
            'merriweather',
            'source-sans-3',
            'inter',
            'nunito',
            'poppins',
            'ibm-plex-sans',
            'open-sans',
            'system-ui',
            'georgia',
        ];
    }

    public static function isValid(?string $id): bool
    {
        if ($id === null || $id === '') {
            return true;
        }

        return in_array($id, self::ids(), true);
    }

    public static function normalize(?string $id): ?string
    {
        if ($id === null || trim($id) === '') {
            return null;
        }

        $trimmed = trim($id);

        return self::isValid($trimmed) ? $trimmed : null;
    }
}
