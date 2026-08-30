<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 21:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 21:30:00
 */

namespace Database\Seeders;

use App\Models\Dapukan;
use App\Models\User;
use Illuminate\Database\Seeder;
use InvalidArgumentException;

class ProductionAdminSeeder extends Seeder
{
    public function run(): void
    {
        $username = trim((string) env('BOOTSTRAP_ADMIN_USERNAME', ''));
        $email = trim((string) env('BOOTSTRAP_ADMIN_EMAIL', ''));
        $password = (string) env('BOOTSTRAP_ADMIN_PASSWORD', '');
        $name = trim((string) env('BOOTSTRAP_ADMIN_NAME', 'Super Admin SIJAMA'));

        if ($username === '' || $email === '' || $password === '') {
            $this->command?->warn(
                'ProductionAdminSeeder skipped: set BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD.',
            );

            return;
        }

        if (strlen($password) < 8) {
            throw new InvalidArgumentException('BOOTSTRAP_ADMIN_PASSWORD minimal 8 karakter.');
        }

        $superadmin = Dapukan::query()->where('slug', 'superadmin')->first();

        if (! $superadmin) {
            throw new InvalidArgumentException('Dapukan superadmin belum ada. Jalankan RbacSeeder terlebih dahulu.');
        }

        User::query()->updateOrCreate(
            ['username' => $username],
            [
                'name' => $name !== '' ? $name : 'Super Admin SIJAMA',
                'email' => $email,
                'password' => $password,
                'dapukan_id' => $superadmin->id,
                'pusat_id' => null,
                'daerah_id' => null,
                'desa_id' => null,
                'kelompok_id' => null,
                'is_active' => true,
            ],
        );

        $this->command?->info("Production admin '{$username}' siap (Super Admin).");
    }
}
