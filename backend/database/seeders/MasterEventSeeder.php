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
            ['kode' => 'pengajian', 'nama' => 'Pengajian', 'calendar_color' => '#0f766e'],
            ['kode' => 'sosial', 'nama' => 'Sosial', 'calendar_color' => '#2563eb'],
            ['kode' => 'dakwah', 'nama' => 'Dakwah', 'calendar_color' => '#7c3aed'],
            ['kode' => 'pendidikan', 'nama' => 'Pendidikan', 'calendar_color' => '#0891b2'],
            ['kode' => 'olahraga', 'nama' => 'Olahraga', 'calendar_color' => '#16a34a'],
            ['kode' => 'keputrian', 'nama' => 'Keputrian', 'calendar_color' => '#db2777'],
            ['kode' => 'pemuda', 'nama' => 'Pemuda', 'calendar_color' => '#ea580c'],
            ['kode' => 'lainnya', 'nama' => 'Lainnya', 'calendar_color' => '#64748b'],
        ] as $row) {
            KategoriKegiatan::updateOrCreate(
                ['kode' => $row['kode']],
                [
                    'nama' => $row['nama'],
                    'deskripsi' => null,
                    'calendar_color' => $row['calendar_color'],
                    'is_active' => true,
                ]
            );
        }

        foreach ([
            ['kode' => 'tafsir', 'nama' => 'Tafsir'],
            ['kode' => 'hadits', 'nama' => 'Hadits'],
            ['kode' => 'fiqih', 'nama' => 'Fiqih'],
            ['kode' => 'akhlak', 'nama' => 'Akhlak'],
            ['kode' => 'sirah', 'nama' => 'Sirah'],
            ['kode' => 'muamalah', 'nama' => 'Muamalah'],
            ['kode' => 'keluarga', 'nama' => 'Keluarga / Pernikahan'],
        ] as $row) {
            Materi::updateOrCreate(
                ['kode' => $row['kode']],
                ['nama' => $row['nama'], 'deskripsi' => null, 'is_active' => true]
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
            Lokasi::updateOrCreate(
                ['kode' => $item['kode']],
                [
                    'nama' => $item['nama'],
                    'jenis' => $item['jenis'] ?? 'masjid',
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
