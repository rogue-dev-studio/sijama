<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 21:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 21:55:00
 */

namespace Database\Seeders;

use App\Models\Dapukan;
use App\Models\Daerah;
use App\Models\Desa;
use App\Models\Kelompok;
use App\Models\Pusat;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProductionDemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        if (! filter_var(env('BOOTSTRAP_DEMO_USERS', false), FILTER_VALIDATE_BOOLEAN)) {
            $this->command?->warn('ProductionDemoUsersSeeder skipped: set BOOTSTRAP_DEMO_USERS=true.');

            return;
        }

        $password = (string) env('BOOTSTRAP_DEMO_PASSWORD', 'password');

        if (strlen($password) < 8) {
            $this->command?->error('BOOTSTRAP_DEMO_PASSWORD minimal 8 karakter.');

            return;
        }

        $superadmin = Dapukan::where('slug', 'superadmin')->firstOrFail();
        $adminPusat = Dapukan::where('slug', 'admin_pusat')->firstOrFail();
        $adminDaerah = Dapukan::where('slug', 'admin_daerah')->firstOrFail();
        $adminDesa = Dapukan::where('slug', 'admin_desa')->firstOrFail();
        $adminKelompok = Dapukan::where('slug', 'admin_kelompok')->firstOrFail();
        $fourSDaerah = Dapukan::where('slug', '4s_daerah')->firstOrFail();
        $fourSKelompok = Dapukan::where('slug', '4s_kelompok')->firstOrFail();
        $jamaahKelompok = Dapukan::where('slug', 'jamaah_kelompok')->firstOrFail();
        $pnkbDaerah = Dapukan::where('slug', 'pnkb_daerah')->firstOrFail();

        $pusatBarat = Pusat::where('kode', 'indonesia-barat')->firstOrFail();
        $bandungUtara = Daerah::where('kode', '05')->firstOrFail();
        $bojonegara = Desa::query()
            ->where('daerah_id', $bandungUtara->id)
            ->where('kode', '02')
            ->firstOrFail();
        $pajajaranTimur = Kelompok::query()
            ->where('desa_id', $bojonegara->id)
            ->where('nama', 'Pajajaran Timur')
            ->firstOrFail();

        $accounts = [
            ['username' => 'admin', 'name' => 'Super Admin SIJAMA', 'email' => 'admin@sijama.local', 'dapukan_id' => $superadmin->id],
            ['username' => 'admin.pusat', 'name' => 'Admin Pusat Indonesia Barat', 'email' => 'admin.pusat@sijama.local', 'dapukan_id' => $adminPusat->id, 'pusat_id' => $pusatBarat->id],
            ['username' => 'admin.daerah', 'name' => 'Admin Daerah Bandung Utara', 'email' => 'admin.daerah@sijama.local', 'dapukan_id' => $adminDaerah->id, 'daerah_id' => $bandungUtara->id],
            ['username' => 'admin.desa', 'name' => 'Admin Desa Bojonegara', 'email' => 'admin.desa@sijama.local', 'dapukan_id' => $adminDesa->id, 'daerah_id' => $bandungUtara->id, 'desa_id' => $bojonegara->id],
            ['username' => 'operator', 'name' => 'Operator Kelompok Pajajaran Timur', 'email' => 'operator@sijama.local', 'dapukan_id' => $adminKelompok->id, 'daerah_id' => $bandungUtara->id, 'desa_id' => $bojonegara->id, 'kelompok_id' => $pajajaranTimur->id],
            ['username' => '4s.daerah', 'name' => 'Petugas 4S Daerah', 'email' => '4s.daerah@sijama.local', 'dapukan_id' => $fourSDaerah->id, 'daerah_id' => $bandungUtara->id],
            ['username' => 'petugas', 'name' => 'Petugas 4S Kelompok', 'email' => 'petugas@sijama.local', 'dapukan_id' => $fourSKelompok->id, 'daerah_id' => $bandungUtara->id, 'desa_id' => $bojonegara->id, 'kelompok_id' => $pajajaranTimur->id],
            ['username' => 'jamaah', 'name' => 'Jamaah Kelompok', 'email' => 'jamaah@sijama.local', 'dapukan_id' => $jamaahKelompok->id, 'daerah_id' => $bandungUtara->id, 'desa_id' => $bojonegara->id, 'kelompok_id' => $pajajaranTimur->id],
            ['username' => 'pnkb.daerah', 'name' => 'Petugas PNKB Daerah', 'email' => 'pnkb.daerah@sijama.local', 'dapukan_id' => $pnkbDaerah->id, 'daerah_id' => $bandungUtara->id],
        ];

        foreach ($accounts as $account) {
            User::query()->updateOrCreate(
                ['username' => $account['username']],
                [
                    'name' => $account['name'],
                    'email' => $account['email'],
                    'password' => $password,
                    'dapukan_id' => $account['dapukan_id'],
                    'pusat_id' => $account['pusat_id'] ?? null,
                    'daerah_id' => $account['daerah_id'] ?? null,
                    'desa_id' => $account['desa_id'] ?? null,
                    'kelompok_id' => $account['kelompok_id'] ?? null,
                    'is_active' => true,
                ],
            );
        }

        User::query()->whereIn('username', [
            '5s.pusat',
            '5s.daerah',
            '5s.desa',
            '5s.kelompok',
        ])->update(['is_active' => false]);

        $this->command?->info('Demo users production: '.count($accounts).' akun (password dari BOOTSTRAP_DEMO_PASSWORD).');
    }
}
