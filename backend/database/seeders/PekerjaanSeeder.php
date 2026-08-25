<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:06:41
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:06:41
 */

namespace Database\Seeders;

use App\Models\Pekerjaan;
use Illuminate\Database\Seeder;

class PekerjaanSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['nama' => 'PNS / ASN'],
            ['nama' => 'TNI / Polri'],
            ['nama' => 'Karyawan swasta'],
            ['nama' => 'Wiraswasta'],
            ['nama' => 'Petani'],
            ['nama' => 'Nelayan'],
            ['nama' => 'Buruh'],
            ['nama' => 'Guru'],
            ['nama' => 'Dosen'],
            ['nama' => 'Tenaga kesehatan'],
            ['nama' => 'Mahasiswa'],
            ['nama' => 'Pelajar'],
            ['nama' => 'Ibu rumah tangga'],
            ['nama' => 'Pensiunan'],
            ['nama' => 'Tidak bekerja'],
            ['nama' => 'Lainnya'],
        ];

        foreach ($items as $item) {
            Pekerjaan::updateOrCreate(
                ['nama' => $item['nama']],
                [
                    'is_active' => true,
                ]
            );
        }
    }
}
