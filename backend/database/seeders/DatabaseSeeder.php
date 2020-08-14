<?php

namespace Database\Seeders;

use App\Models\Dapukan;
use App\Models\Daerah;
use App\Models\Desa;
use App\Models\Kelompok;
use App\Models\Pusat;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Local/demo seed: master data + akun uji. Tidak mengisi dummy jamaah/NIK.
     * Do not run against shared/staging/production environments.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->command?->warn('DatabaseSeeder skipped outside local/testing.');

            return;
        }

        $this->call(RbacSeeder::class);
        $this->call(WilayahAdministrasiSeeder::class);
        $this->call(WilayahSeeder::class);
        $this->call(PekerjaanSeeder::class);
        $this->call(MasterEventSeeder::class);
        $this->call(HariLiburSeeder::class);

        $superadmin = Dapukan::where('kode', 'superadmin')->firstOrFail();
        $adminPusat = Dapukan::where('kode', 'admin_pusat')->firstOrFail();
        $adminDaerah = Dapukan::where('kode', 'admin_daerah')->firstOrFail();
        $adminDesa = Dapukan::where('kode', 'admin_desa')->firstOrFail();
        $adminKelompok = Dapukan::where('kode', 'admin_kelompok')->firstOrFail();
        $fourSDaerah = Dapukan::where('kode', '4s_daerah')->firstOrFail();
        $fourSKelompok = Dapukan::where('kode', '4s_kelompok')->firstOrFail();
        $jamaahKelompok = Dapukan::where('kode', 'jamaah_kelompok')->firstOrFail();
        $pnkbDaerah = Dapukan::where('kode', 'pnkb_daerah')->firstOrFail();

        $pusatBarat = Pusat::where('kode', 'indonesia-barat')->firstOrFail();
        $bandungUtara = Daerah::where('kode', 'bandung-utara')->firstOrFail();
        $bojonegara = Desa::where('kode', 'bojonegara')->firstOrFail();
        $pajajaranTimur = Kelompok::where('kode', 'pajajaran-timur')->firstOrFail();

        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Super Admin SIJAMA',
                'email' => 'admin@sijama.local',
                'password' => Hash::make('password'),
                'dapukan_id' => $superadmin->id,
                'pusat_id' => null,
                'daerah_id' => null,
                'desa_id' => null,
                'kelompok_id' => null,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['username' => 'admin.pusat'],
            [
                'name' => 'Admin Pusat Indonesia Barat',
                'email' => 'admin.pusat@sijama.local',
                'password' => Hash::make('password'),
                'dapukan_id' => $adminPusat->id,
                'pusat_id' => $pusatBarat->id,
                'daerah_id' => null,
                'desa_id' => null,
                'kelompok_id' => null,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['username' => 'admin.daerah'],
            [
                'name' => 'Admin Daerah Bandung Utara',
                'email' => 'admin.daerah@sijama.local',
                'password' => Hash::make('password'),
                'dapukan_id' => $adminDaerah->id,
                'daerah_id' => $bandungUtara->id,
                'desa_id' => null,
                'kelompok_id' => null,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['username' => 'admin.desa'],
            [
                'name' => 'Admin Desa Bojonegara',
                'email' => 'admin.desa@sijama.local',
                'password' => Hash::make('password'),
                'dapukan_id' => $adminDesa->id,
                'daerah_id' => $bandungUtara->id,
                'desa_id' => $bojonegara->id,
                'kelompok_id' => null,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['username' => 'operator'],
            [
                'name' => 'Operator Kelompok Pajajaran Timur',
                'email' => 'operator@sijama.local',
                'password' => Hash::make('password'),
                'dapukan_id' => $adminKelompok->id,
                'daerah_id' => $bandungUtara->id,
                'desa_id' => $bojonegara->id,
                'kelompok_id' => $pajajaranTimur->id,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['username' => '4s.daerah'],
            [
                'name' => 'Petugas 4S Daerah',
                'email' => '4s.daerah@sijama.local',
                'password' => Hash::make('password'),
                'dapukan_id' => $fourSDaerah->id,
                'daerah_id' => $bandungUtara->id,
                'desa_id' => null,
                'kelompok_id' => null,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['username' => 'petugas'],
            [
                'name' => 'Petugas 4S Kelompok',
                'email' => 'petugas@sijama.local',
                'password' => Hash::make('password'),
                'dapukan_id' => $fourSKelompok->id,
                'daerah_id' => $bandungUtara->id,
                'desa_id' => $bojonegara->id,
                'kelompok_id' => $pajajaranTimur->id,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['username' => 'jamaah'],
            [
                'name' => 'Jamaah Kelompok',
                'email' => 'jamaah@sijama.local',
                'password' => Hash::make('password'),
                'dapukan_id' => $jamaahKelompok->id,
                'daerah_id' => $bandungUtara->id,
                'desa_id' => $bojonegara->id,
                'kelompok_id' => $pajajaranTimur->id,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['username' => 'pnkb.daerah'],
            [
                'name' => 'Petugas PNKB Daerah',
                'email' => 'pnkb.daerah@sijama.local',
                'password' => Hash::make('password'),
                'dapukan_id' => $pnkbDaerah->id,
                'daerah_id' => $bandungUtara->id,
                'desa_id' => null,
                'kelompok_id' => null,
                'is_active' => true,
            ]
        );

        User::whereIn('username', [
            '5s.pusat',
            '5s.daerah',
            '5s.desa',
            '5s.kelompok',
        ])->update(['is_active' => false]);
    }
}
