<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 11:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 13:05:00
 */

namespace Database\Seeders;

use App\Models\Dapukan;
use App\Models\Daerah;
use App\Models\Desa;
use App\Models\HakAkses;
use App\Models\Kelompok;
use App\Models\Pusat;
use App\Models\User;
use App\Support\SuperAdminAccess;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use InvalidArgumentException;

class DemoUsersSeeder extends Seeder
{
    /** @var list<string> */
    private const DEMO_DAPUKAN_SLUGS = [
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

    public function run(): void
    {
        $this->ensureRbacAndSuperadminFullAccess();

        $superadmin = Dapukan::where('slug', 'superadmin')->firstOrFail();
        $adminPusat = Dapukan::where('slug', 'admin_pusat')->firstOrFail();
        $adminDaerah = Dapukan::where('slug', 'admin_daerah')->firstOrFail();
        $adminDesa = Dapukan::where('slug', 'admin_desa')->firstOrFail();
        $adminKelompok = Dapukan::where('slug', 'admin_kelompok')->firstOrFail();
        $fourSDaerah = Dapukan::where('slug', '4s_daerah')->firstOrFail();
        $fourSKelompok = Dapukan::where('slug', '4s_kelompok')->firstOrFail();
        $jamaahKelompok = Dapukan::where('slug', 'jamaah_kelompok')->firstOrFail();
        $pnkbDaerah = Dapukan::where('slug', 'pnkb_daerah')->firstOrFail();

        $pusatBarat = Pusat::where('kode', 'indonesia-barat')->first();
        $bandungUtara = Daerah::where('kode', '05')->first();
        $bojonegara = $bandungUtara
            ? Desa::query()
                ->where('wilayah_fung_daerah_id', $bandungUtara->id)
                ->where('kode', '02')
                ->first()
            : null;
        $pajajaranTimur = $bojonegara
            ? Kelompok::query()
                ->where('wilayah_fung_desa_id', $bojonegara->id)
                ->where('nama', 'Pajajaran Timur')
                ->first()
            : null;

        if (! $pusatBarat || ! $bandungUtara || ! $bojonegara || ! $pajajaranTimur) {
            throw new InvalidArgumentException(
                'DemoUsersSeeder membutuhkan WilayahSeeder (Pajajaran Timur). Jalankan: db:seed --class=WilayahSeeder --force.',
            );
        }

        $password = SuperAdminAccess::bootstrapPassword();

        $accounts = [
            [
                'username' => 'admin',
                'name' => 'Super Admin SIJAMA',
                'email' => 'admin@sijama.local',
                'dapukan_id' => $superadmin->id,
            ],
            [
                'username' => 'admin.pusat',
                'name' => 'Admin Pusat Indonesia Barat',
                'email' => 'admin.pusat@sijama.local',
                'dapukan_id' => $adminPusat->id,
                'wilayah_fung_pusat_id' => $pusatBarat->id,
            ],
            [
                'username' => 'admin.daerah',
                'name' => 'Admin Daerah Bandung Utara',
                'email' => 'admin.daerah@sijama.local',
                'dapukan_id' => $adminDaerah->id,
                'wilayah_fung_pusat_id' => $pusatBarat->id,
                'wilayah_fung_daerah_id' => $bandungUtara->id,
            ],
            [
                'username' => 'admin.desa',
                'name' => 'Admin Desa Bojonegara',
                'email' => 'admin.desa@sijama.local',
                'dapukan_id' => $adminDesa->id,
                'wilayah_fung_pusat_id' => $pusatBarat->id,
                'wilayah_fung_daerah_id' => $bandungUtara->id,
                'wilayah_fung_desa_id' => $bojonegara->id,
            ],
            [
                'username' => 'operator',
                'name' => 'Operator Kelompok Pajajaran Timur',
                'email' => 'operator@sijama.local',
                'dapukan_id' => $adminKelompok->id,
                'wilayah_fung_pusat_id' => $pusatBarat->id,
                'wilayah_fung_daerah_id' => $bandungUtara->id,
                'wilayah_fung_desa_id' => $bojonegara->id,
                'wilayah_fung_kelompok_id' => $pajajaranTimur->id,
            ],
            [
                'username' => '4s.daerah',
                'name' => 'Petugas 4S Daerah',
                'email' => '4s.daerah@sijama.local',
                'dapukan_id' => $fourSDaerah->id,
                'wilayah_fung_pusat_id' => $pusatBarat->id,
                'wilayah_fung_daerah_id' => $bandungUtara->id,
            ],
            [
                'username' => 'petugas',
                'name' => 'Petugas 4S Kelompok',
                'email' => 'petugas@sijama.local',
                'dapukan_id' => $fourSKelompok->id,
                'wilayah_fung_pusat_id' => $pusatBarat->id,
                'wilayah_fung_daerah_id' => $bandungUtara->id,
                'wilayah_fung_desa_id' => $bojonegara->id,
                'wilayah_fung_kelompok_id' => $pajajaranTimur->id,
            ],
            [
                'username' => 'jamaah',
                'name' => 'Jamaah Kelompok',
                'email' => 'jamaah@sijama.local',
                'dapukan_id' => $jamaahKelompok->id,
                'wilayah_fung_pusat_id' => $pusatBarat->id,
                'wilayah_fung_daerah_id' => $bandungUtara->id,
                'wilayah_fung_desa_id' => $bojonegara->id,
                'wilayah_fung_kelompok_id' => $pajajaranTimur->id,
            ],
            [
                'username' => 'pnkb.daerah',
                'name' => 'Petugas PNKB Daerah',
                'email' => 'pnkb.daerah@sijama.local',
                'dapukan_id' => $pnkbDaerah->id,
                'wilayah_fung_pusat_id' => $pusatBarat->id,
                'wilayah_fung_daerah_id' => $bandungUtara->id,
            ],
        ];

        foreach ($accounts as $account) {
            $this->seedDemoUser($account, $password);
        }

        User::query()->whereIn('username', [
            '5s.pusat',
            '5s.daerah',
            '5s.desa',
            '5s.kelompok',
        ])->update(['is_active' => false]);

        $this->assertDemoUsersHavePermissions($accounts);

        $this->command?->info('DemoUsersSeeder: '.count($accounts).' akun demo siap (tidak dapat dihapus).');
    }

    private function ensureRbacAndSuperadminFullAccess(): void
    {
        if (! Schema::hasTable('dapukan_m') || ! Schema::hasTable('hak_akses_m') || ! Schema::hasTable('fitur_m')) {
            throw new InvalidArgumentException(
                'DemoUsersSeeder membutuhkan migrasi RBAC (dapukan_m, fitur_m, hak_akses_m). Jalankan migrate lalu db:seed.',
            );
        }

        $needsRbac = Dapukan::query()->where('slug', 'superadmin')->doesntExist()
            || HakAkses::query()->doesntExist()
            || Dapukan::query()
                ->whereIn('slug', self::DEMO_DAPUKAN_SLUGS)
                ->whereDoesntHave('hakAkses')
                ->exists();

        if ($needsRbac) {
            $this->call(RbacSeeder::class);
        }

        SuperAdminAccess::grantAll();
        SuperAdminAccess::ensureReservedUser();
    }

    /**
     * @param  list<array<string, mixed>>  $accounts
     */
    private function assertDemoUsersHavePermissions(array $accounts): void
    {
        $allSlugs = HakAkses::query()->orderBy('slug')->pluck('slug')->all();
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        $admin->unsetRelation('dapukan');
        $missing = array_values(array_diff($allSlugs, $admin->permissionCodes()));

        if ($missing !== []) {
            throw new InvalidArgumentException(
                'DemoUsersSeeder: superadmin belum full akses ('.count($missing).' hak akses hilang).',
            );
        }

        foreach ($accounts as $account) {
            $user = User::query()->where('username', $account['username'])->firstOrFail();
            $user->unsetRelation('dapukan');

            if ($user->permissionCodes() === []) {
                throw new InvalidArgumentException(
                    "DemoUsersSeeder: akun {$account['username']} tidak punya hak akses. Jalankan RbacSeeder.",
                );
            }
        }
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function seedDemoUser(array $attributes, string $password): void
    {
        $username = (string) $attributes['username'];
        $payload = array_merge($attributes, [
            'password' => $password,
            'is_active' => true,
            'is_demo' => true,
        ]);

        $existing = User::query()->where('username', $username)->first();

        if ($existing) {
            $existing->updateAttributes($this->normalizeScopePayload($payload));

            return;
        }

        User::createManaged($this->normalizeScopePayload($payload));
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizeScopePayload(array $payload): array
    {
        foreach (['wilayah_fung_pusat_id', 'wilayah_fung_daerah_id', 'wilayah_fung_desa_id', 'wilayah_fung_kelompok_id'] as $key) {
            if (! array_key_exists($key, $payload)) {
                $payload[$key] = null;
            }
        }

        return $payload;
    }
}
