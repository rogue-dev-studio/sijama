<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 13:13:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 13:25:00
 */

namespace App\Support;

use App\Models\Dapukan;
use App\Models\Fitur;
use App\Models\HakAkses;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

final class SuperAdminAccess
{
    public const DAPUKAN_SLUG = 'superadmin';

    public const RESERVED_USERNAME = 'admin';

    private static bool $autoProvision = true;

    /**
     * @template T
     * @param  callable(): T  $callback
     * @return T
     */
    public static function withoutAutoProvision(callable $callback): mixed
    {
        $previous = self::$autoProvision;
        self::$autoProvision = false;

        try {
            return $callback();
        } finally {
            self::$autoProvision = $previous;
        }
    }

    public static function dapukan(): ?Dapukan
    {
        if (! Schema::hasTable('dapukan_m')) {
            return null;
        }

        return Dapukan::query()->where('slug', self::DAPUKAN_SLUG)->first();
    }

    public static function isSuperadminDapukan(Dapukan $dapukan): bool
    {
        return $dapukan->slug === self::DAPUKAN_SLUG;
    }

    public static function provisionMenu(Menu $menu): void
    {
        if (! self::$autoProvision || ! Schema::hasTable('fitur_m')) {
            return;
        }

        if ($menu->path === null || $menu->path === '') {
            return;
        }

        $fitur = Fitur::query()->firstOrCreate(
            [
                'menu_id' => $menu->id,
                'slug' => $menu->slug,
            ],
            [
                'nama' => $menu->nama,
                'is_active' => (bool) $menu->is_active,
            ],
        );

        self::provisionFitur($fitur);
    }

    public static function provisionFitur(Fitur $fitur): void
    {
        if (! self::$autoProvision || ! Schema::hasTable('hak_akses_m')) {
            return;
        }

        $prefix = str_replace('-', '_', $fitur->slug);
        $actions = [
            'view' => 'Lihat',
            'create' => 'Tambah',
            'update' => 'Ubah',
            'delete' => 'Hapus',
        ];

        foreach ($actions as $aksi => $label) {
            $hak = HakAkses::query()->firstOrCreate(
                ['slug' => $prefix.'.'.$aksi],
                [
                    'fitur_id' => $fitur->id,
                    'nama' => $label.' '.$fitur->nama,
                    'aksi' => $aksi,
                ],
            );
            self::grant($hak);
        }
    }

    public static function grant(HakAkses $hakAkses): void
    {
        if (! Schema::hasTable('dapukan_hak_akses_mp') || $hakAkses->id === null) {
            return;
        }

        $dapukan = self::dapukan();
        if ($dapukan === null) {
            return;
        }

        $dapukan->hakAkses()->syncWithoutDetaching([(int) $hakAkses->id]);
    }

    public static function grantAll(): void
    {
        if (! Schema::hasTable('hak_akses_m') || ! Schema::hasTable('dapukan_hak_akses_mp')) {
            return;
        }

        $dapukan = self::dapukan();
        if ($dapukan === null) {
            return;
        }

        $allIds = HakAkses::query()->pluck('id')->map(fn ($id) => (int) $id)->all();
        if ($allIds === []) {
            return;
        }

        $dapukan->hakAkses()->sync($allIds);
        $dapukan->unsetRelation('hakAkses');
    }

    public static function ensureReservedUser(): void
    {
        $dapukan = self::dapukan();
        if ($dapukan === null || ! Schema::hasTable('users')) {
            return;
        }

        self::grantAll();

        if (self::activeUserQuery($dapukan->id)->exists()) {
            return;
        }

        $password = self::bootstrapPassword();
        $existing = User::query()->where('username', self::RESERVED_USERNAME)->first();
        $payload = [
            'username' => self::RESERVED_USERNAME,
            'name' => 'Super Admin SIJAMA',
            'email' => 'admin@sijama.local',
            'password' => $password,
            'dapukan_id' => $dapukan->id,
            'wilayah_fung_pusat_id' => null,
            'wilayah_fung_daerah_id' => null,
            'wilayah_fung_desa_id' => null,
            'wilayah_fung_kelompok_id' => null,
            'is_active' => true,
            'is_demo' => true,
        ];

        if ($existing) {
            $existing->updateAttributes($payload);

            return;
        }

        User::createManaged($payload);
    }

    public static function assertCanDeactivate(User $target): void
    {
        if (! $target->isSuperAdmin() || ! $target->is_active) {
            return;
        }

        if (self::otherActiveSuperadminExists($target)) {
            return;
        }

        throw ValidationException::withMessages([
            'username' => ['Akun Super Admin terakhir yang aktif tidak dapat dinonaktifkan.'],
        ]);
    }

    public static function assertCanDelete(User $target): void
    {
        if (! $target->isSuperAdmin()) {
            return;
        }

        throw ValidationException::withMessages([
            'username' => ['Akun Super Admin tidak dapat dihapus.'],
        ]);
    }

    public static function assertCanChangePassword(User $target): void
    {
        if (! $target->isSuperAdmin()) {
            return;
        }

        throw ValidationException::withMessages([
            'password' => ['Password akun Super Admin tidak dapat diubah dari profil.'],
        ]);
    }

    public static function bootstrapPassword(): string
    {
        if (app()->environment(['local', 'testing'])) {
            return 'password';
        }

        $password = (string) env('BOOTSTRAP_DEMO_PASSWORD', env('BOOTSTRAP_ADMIN_PASSWORD', 'password'));

        if (strlen($password) < 8) {
            throw new InvalidArgumentException('Password bootstrap Super Admin minimal 8 karakter.');
        }

        return $password;
    }

    private static function otherActiveSuperadminExists(User $target): bool
    {
        $dapukan = self::dapukan();
        if ($dapukan === null) {
            return false;
        }

        return self::activeUserQuery($dapukan->id)
            ->whereKeyNot($target->id)
            ->exists();
    }

    private static function activeUserQuery(int $dapukanId)
    {
        return User::query()
            ->where('is_active', true)
            ->where('dapukan_id', $dapukanId);
    }
}
