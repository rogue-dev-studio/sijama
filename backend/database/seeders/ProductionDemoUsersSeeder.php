<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 21:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 11:25:00
 */

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * @deprecated Gunakan DemoUsersSeeder. Dipertahankan untuk kompatibilitas script lama.
 */
class ProductionDemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(DemoUsersSeeder::class);
    }
}
