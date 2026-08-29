<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:20:00
 */

namespace App\Support;

use App\Models\Jamaah;
use App\Models\User;

final class UserLoginResolver
{
    public static function findByIdentifier(string $identifier): ?User
    {
        $identifier = trim($identifier);
        if ($identifier === '') {
            return null;
        }

        $phoneVariants = self::phoneVariants($identifier);

        return User::query()
            ->with(['dapukan', 'jamaah.dapukan', 'pusat', 'daerah', 'desa', 'kelompok'])
            ->where(function ($query) use ($identifier, $phoneVariants) {
                $query->where('username', $identifier)
                    ->orWhere('email', $identifier);

                if ($phoneVariants !== []) {
                    $query->orWhereHas(
                        'jamaah',
                        fn ($jamaah) => $jamaah->whereIn('no_hp', $phoneVariants),
                    );
                }
            })
            ->first();
    }

    public static function failureMessage(string $identifier): ?string
    {
        $identifier = trim($identifier);
        if ($identifier === '') {
            return null;
        }

        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            return self::jamaahWithoutAccountMessage(
                Jamaah::query()->where('email', $identifier)->with('user')->first(),
                'Email terdaftar di master jamaah tetapi belum memiliki akun login. Minta admin membuat akun pengguna.',
            );
        }

        $phoneVariants = self::phoneVariants($identifier);
        if ($phoneVariants === []) {
            return null;
        }

        return self::jamaahWithoutAccountMessage(
            Jamaah::query()->whereIn('no_hp', $phoneVariants)->with('user')->first(),
            'Nomor HP terdaftar di master jamaah tetapi belum memiliki akun login. Minta admin membuat akun pengguna.',
        );
    }

    /** @return list<string> */
    public static function phoneVariants(string $value): array
    {
        $digits = preg_replace('/\D+/', '', trim($value)) ?? '';
        if ($digits === '' || strlen($digits) < 8) {
            return [];
        }

        $variants = [trim($value), $digits];

        if (str_starts_with($digits, '0')) {
            $national = substr($digits, 1);
            $variants[] = '62'.$national;
            $variants[] = '+62'.$national;
        } elseif (str_starts_with($digits, '62')) {
            $national = substr($digits, 2);
            $variants[] = '0'.$national;
            $variants[] = '+'.$digits;
        }

        return array_values(array_unique(array_filter($variants)));
    }

    private static function jamaahWithoutAccountMessage(?Jamaah $jamaah, string $message): ?string
    {
        if (! $jamaah || $jamaah->user) {
            return null;
        }

        return $message;
    }
}
