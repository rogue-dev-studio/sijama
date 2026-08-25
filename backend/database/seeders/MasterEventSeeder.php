<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

namespace Database\Seeders;

use App\Models\KategoriKegiatan;
use App\Models\Lokasi;
use App\Models\Materi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class MasterEventSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['nama' => 'Pengajian', 'calendar_color' => '#0f766e'],
            ['nama' => 'Sosial', 'calendar_color' => '#2563eb'],
            ['nama' => 'Dakwah', 'calendar_color' => '#7c3aed'],
            ['nama' => 'Pendidikan', 'calendar_color' => '#0891b2'],
            ['nama' => 'Olahraga', 'calendar_color' => '#16a34a'],
            ['nama' => 'Keputrian', 'calendar_color' => '#db2777'],
            ['nama' => 'Pemuda', 'calendar_color' => '#ea580c'],
            ['nama' => 'Lainnya', 'calendar_color' => '#64748b'],
        ] as $row) {
            KategoriKegiatan::updateOrCreate(
                ['nama' => $row['nama']],
                [
                    'deskripsi' => null,
                    'calendar_color' => $row['calendar_color'],
                    'is_active' => true,
                ]
            );
        }

        foreach ([
            ['nama' => 'Tafsir'],
            ['nama' => 'Hadits'],
            ['nama' => 'Fiqih'],
            ['nama' => 'Akhlak'],
            ['nama' => 'Sirah'],
            ['nama' => 'Muamalah'],
            ['nama' => 'Keluarga / Pernikahan'],
        ] as $row) {
            Materi::updateOrCreate(
                ['nama' => $row['nama']],
                ['deskripsi' => null, 'is_active' => true]
            );
        }

        $path = database_path('seeders/data/lokasi_ldii.json');
        if (! File::exists($path)) {
            $this->command?->warn('lokasi_ldii.json tidak ditemukan. Skip seed lokasi massal.');

            return;
        }

        $items = json_decode(File::get($path), true);
        if (! is_array($items)) {
            return;
        }

        foreach ($items as $item) {
            $nama = $item['nama'] ?? null;
            if (! is_string($nama) || $nama === '') {
                continue;
            }

            $jenis = $item['jenis'] ?? 'masjid';

            Lokasi::updateOrCreate(
                ['nama' => $nama, 'jenis' => $jenis],
                [
                    'kota' => $item['kota'] ?? null,
                    'alamat' => $item['alamat'] ?? null,
                    'lat' => $item['lat'] ?? null,
                    'lng' => $item['lng'] ?? null,
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );
        }
    }
}
