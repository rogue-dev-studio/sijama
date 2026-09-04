<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 19:01:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 19:01:00
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
        $legacyKategori = [
            'Sosial', 'Dakwah', 'Pendidikan', 'Olahraga', 'Keputrian', 'Pemuda', 'Lainnya',
        ];

        KategoriKegiatan::query()
            ->whereIn('nama', $legacyKategori)
            ->update(['is_active' => false]);

        foreach ([
            ['nama' => 'Kemandirian', 'calendar_color' => '#16a34a'],
            ['nama' => 'PPG', 'calendar_color' => '#2563eb'],
            ['nama' => 'Daerahan', 'calendar_color' => '#7c3aed'],
            ['nama' => 'Pengajian', 'calendar_color' => '#0f766e'],
            ['nama' => 'CAI', 'calendar_color' => '#0891b2'],
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

        $legacyMateri = [
            'Tafsir', 'Hadits', 'Fiqih', 'Akhlak', 'Sirah', 'Muamalah', 'Keluarga / Pernikahan',
            'Teks Daerahan PPG Daerah',
        ];

        Materi::query()
            ->whereIn('nama', $legacyMateri)
            ->update(['is_active' => false]);

        foreach ([
            ['nama' => 'Al-Quran'],
            ['nama' => 'Al-Hadits'],
            ['nama' => 'Nasehat'],
            ['nama' => 'Teks Daerahan'],
            ['nama' => 'PPG Daerah'],
            ['nama' => 'FKKI Daerah'],
            ['nama' => 'Organisasi Daerah'],
            ['nama' => 'ST'],
            ['nama' => 'CAI'],
            ['nama' => 'ASAD'],
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
