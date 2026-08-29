<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:25:00
 */

namespace App\Support;

use App\Models\User;

final class UserContactResolver
{
    public static function email(User $user): ?string
    {
        $user->loadMissing('jamaah');

        return $user->email ?? $user->jamaah?->email;
    }

    public static function phone(User $user): ?string
    {
        $user->loadMissing('jamaah');

        return $user->jamaah?->no_hp;
    }

    public static function hasResetContact(User $user): bool
    {
        return self::email($user) !== null || self::phone($user) !== null;
    }

    public static function matchesEmail(User $user, string $input): bool
    {
        $email = self::email($user);
        if (! $email) {
            return false;
        }

        return strcasecmp(trim($input), $email) === 0;
    }

    public static function matchesPhone(User $user, string $input): bool
    {
        $phone = self::phone($user);
        if (! $phone) {
            return false;
        }

        $inputVariants = UserLoginResolver::phoneVariants($input);
        $phoneVariants = UserLoginResolver::phoneVariants($phone);

        return array_intersect($inputVariants, $phoneVariants) !== [];
    }

    public static function matchesContact(User $user, string $input): bool
    {
        return self::matchesEmail($user, $input) || self::matchesPhone($user, $input);
    }

    public static function maskEmail(string $email): string
    {
        $parts = explode('@', $email, 2);
        if (count($parts) !== 2) {
            return '***';
        }

        [$local, $domain] = $parts;
        $visible = substr($local, 0, min(2, strlen($local)));

        return $visible.'***@'.$domain;
    }

    public static function maskPhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';
        if ($digits === '') {
            return '****';
        }
        if (strlen($digits) <= 7) {
            return str_repeat('*', max(0, strlen($digits) - 2)).substr($digits, -2);
        }

        return substr($digits, 0, 4).str_repeat('*', strlen($digits) - 7).substr($digits, -3);
    }
}
