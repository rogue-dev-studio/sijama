<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 15:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:40:00
 */

namespace App\Support;

final class PhoneNumberNormalizer
{
    public static function toInternationalDigits(string $phone, string $countryCode = '62'): ?string
    {
        $digits = preg_replace('/\D+/', '', trim($phone)) ?? '';
        if ($digits === '' || strlen($digits) < 8) {
            return null;
        }

        $countryCode = ltrim($countryCode, '+');

        if (str_starts_with($digits, $countryCode)) {
            return $digits;
        }

        if (str_starts_with($digits, '0')) {
            return $countryCode.substr($digits, 1);
        }

        return $countryCode.$digits;
    }
}
