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
            ['kode' => 'pns', 'nama' => 'PNS / ASN'],
            ['kode' => 'tni_polri', 'nama' => 'TNI / Polri'],
            ['kode' => 'karyawan_swasta', 'nama' => 'Karyawan swasta'],
            ['kode' => 'wiraswasta', 'nama' => 'Wiraswasta'],
            ['kode' => 'petani', 'nama' => 'Petani'],
            ['kode' => 'nelayan', 'nama' => 'Nelayan'],
            ['kode' => 'buruh', 'nama' => 'Buruh'],
            ['kode' => 'guru', 'nama' => 'Guru'],
            ['kode' => 'dosen', 'nama' => 'Dosen'],
            ['kode' => 'tenaga_kesehatan', 'nama' => 'Tenaga kesehatan'],
            ['kode' => 'mahasiswa', 'nama' => 'Mahasiswa'],
            ['kode' => 'pelajar', 'nama' => 'Pelajar'],
            ['kode' => 'ibu_rumah_tangga', 'nama' => 'Ibu rumah tangga'],
            ['kode' => 'pensiunan', 'nama' => 'Pensiunan'],
            ['kode' => 'tidak_bekerja', 'nama' => 'Tidak bekerja'],
            ['kode' => 'lainnya', 'nama' => 'Lainnya'],
        ];

        foreach ($items as $item) {
            Pekerjaan::updateOrCreate(
                ['kode' => $item['kode']],
                [
                    'nama' => $item['nama'],
                    'is_active' => true,
                ]
            );
        }
    }
}
