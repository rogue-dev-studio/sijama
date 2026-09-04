<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:26:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 15:02:00
 */

namespace App\Support;

use App\Models\Dapukan;
use App\Models\User;
use Illuminate\Validation\ValidationException;

final class DemoUserGuard
{
    /** @var list<string> */
    public const DEMO_USERNAMES = [
        'admin',
        'admin.pusat',
        'admin.daerah',
        'admin.desa',
        'operator',
        '4s.daerah',
        'petugas',
        'jamaah',
        'pnkb.daerah',
    ];

    /** @var list<string> */
    public const DEMO_DAPUKAN_SLUGS = [
        'superadmin',
        'admin_pusat',
        'admin_daerah',
        'admin_desa',
        'admin_kelompok',
        '4s_daerah',
        '4s_kelompok',
        'jamaah_kelompok',
        'pnkb_daerah',
    ];

    public static function isDemoUser(User $user): bool
    {
        if ((bool) $user->is_demo) {
            return true;
        }

        return in_array($user->username, self::DEMO_USERNAMES, true);
    }

    public static function isReservedUsername(string $username): bool
    {
        return in_array($username, self::DEMO_USERNAMES, true);
    }

    public static function isDemoDapukan(Dapukan $dapukan): bool
    {
        if ((bool) $dapukan->is_system) {
            return true;
        }

        return in_array((string) $dapukan->slug, self::DEMO_DAPUKAN_SLUGS, true);
    }

    public static function assertCanDelete(User $target): void
    {
        if (! self::isDemoUser($target)) {
            return;
        }

        throw ValidationException::withMessages([
            'username' => ['Akun demo tidak dapat dihapus.'],
        ]);
    }

    public static function assertCanUpdate(User $target): void
    {
        if (! self::isDemoUser($target)) {
            return;
        }

        throw ValidationException::withMessages([
            'username' => ['Akun demo tidak dapat diedit (termasuk password dan status).'],
        ]);
    }

    public static function assertCanDeactivate(User $target): void
    {
        if (! self::isDemoUser($target)) {
            return;
        }

        throw ValidationException::withMessages([
            'username' => ['Akun demo tidak dapat dinonaktifkan.'],
        ]);
    }

    public static function assertCanChangePassword(User $target): void
    {
        if (! self::isDemoUser($target)) {
            return;
        }

        throw ValidationException::withMessages([
            'password' => ['Password akun demo tidak dapat diubah.'],
        ]);
    }

    public static function assertCanMutateDapukan(Dapukan $dapukan): void
    {
        if (! self::isDemoDapukan($dapukan)) {
            return;
        }

        throw ValidationException::withMessages([
            'dapukan' => ['Dapukan sistem / peran akun demo tidak dapat diubah atau dinonaktifkan.'],
        ]);
    }
}
