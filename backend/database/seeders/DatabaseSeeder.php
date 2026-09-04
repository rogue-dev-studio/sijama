<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Local/dev seed: master data + akun login demo.
     * Tidak mengisi dummy transaksional (jamaah, keluarga, pengajian, kegiatan, kehadiran).
     * Data dummy opsional: php artisan db:seed --class=DemoDataSeeder
     * Do not run against shared/staging/production environments.
     *
     * Urutan: RBAC → konfig sistem → wilayah (+ akun demo via WilayahSeeder) → lookup master → konfig dokumen → event master.
     * Akun demo (`DemoUsersSeeder`) ikut setiap `WilayahSeeder` di semua environment; dilindungi `DemoUserGuard`.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->command?->warn('DatabaseSeeder skipped outside local/testing.');

            return;
        }

        $this->call(RbacSeeder::class);
        $this->call(KonfigSystemSeeder::class);
        $this->call(WilayahAdministrasiSeeder::class);
        $this->call(KodePosSeeder::class);
        $this->call(WilayahSeeder::class);
        $this->call(LookupMSeeder::class);
        $this->call(KonfigDokumenSeeder::class);
        $this->call(MasterEventSeeder::class);
        $this->call(HariLiburSeeder::class);
        $this->call(AppPollDemoSeeder::class);
    }
}
