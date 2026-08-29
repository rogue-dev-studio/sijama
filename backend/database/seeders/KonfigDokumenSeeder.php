<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:52:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:06:32
 */

namespace Database\Seeders;

use App\Models\KonfigDokumenK;
use App\Models\LookupM;
use App\Support\DocumentKonfig;
use App\Support\LookupTypes;
use Illuminate\Database\Seeder;

class KonfigDokumenSeeder extends Seeder
{
    public function run(): void
    {
        $prints = [
            ['lookup_value' => 'laporan_kehadiran', 'lookup_name' => 'Cetakan Laporan Kehadiran', 'lookup_urutan' => 1],
            ['lookup_value' => 'laporan_jamaah', 'lookup_name' => 'Cetakan Laporan Jamaah', 'lookup_urutan' => 2],
            ['lookup_value' => 'laporan_pengajian', 'lookup_name' => 'Cetakan Laporan Pengajian', 'lookup_urutan' => 3],
            ['lookup_value' => 'laporan_kegiatan', 'lookup_name' => 'Cetakan Laporan Kegiatan', 'lookup_urutan' => 4],
            ['lookup_value' => 'jamaah', 'lookup_name' => 'Cetakan Daftar Jamaah', 'lookup_urutan' => 5],
            ['lookup_value' => 'pengajian', 'lookup_name' => 'Cetakan Daftar Pengajian', 'lookup_urutan' => 6],
            ['lookup_value' => 'kegiatan', 'lookup_name' => 'Cetakan Daftar Kegiatan', 'lookup_urutan' => 7],
            ['lookup_value' => 'kehadiran', 'lookup_name' => 'Cetakan Kehadiran', 'lookup_urutan' => 8],
            ['lookup_value' => 'kategori_umur', 'lookup_name' => 'Cetakan Kategori Umur', 'lookup_urutan' => 9],
            ['lookup_value' => 'master_users', 'lookup_name' => 'Cetakan Master Pengguna', 'lookup_urutan' => 10],
            ['lookup_value' => 'matriks', 'lookup_name' => 'Cetakan Matriks Akses', 'lookup_urutan' => 11],
            ['lookup_value' => 'master_list', 'lookup_name' => 'Cetakan Master List', 'lookup_urutan' => 12],
        ];

        $defaults = DocumentKonfig::fallbackBrand();

        foreach ($prints as $item) {
            $lookup = LookupM::query()->updateOrCreate(
                [
                    'lookup_type' => LookupTypes::KONFIG_DOKUMEN,
                    'lookup_value' => $item['lookup_value'],
                    'is_deleted' => false,
                ],
                [
                    'lookup_name' => $item['lookup_name'],
                    'lookup_kode' => $item['lookup_value'],
                    'lookup_urutan' => $item['lookup_urutan'],
                    'is_active' => true,
                    'created_date' => now(),
                    'modified_count' => 0,
                ]
            );

            $existing = KonfigDokumenK::query()
                ->notDeleted()
                ->where('lookup_id', $lookup->lookup_id)
                ->first();

            if ($existing) {
                continue;
            }

            KonfigDokumenK::query()->create([
                'lookup_id' => $lookup->lookup_id,
                'header' => $defaults['header'],
                'header_detail' => $item['lookup_name'],
                'footer' => $defaults['footer'],
                'footer_detail' => $defaults['footer_detail'],
                'apply_pdf' => $defaults['apply_pdf'],
                'apply_excel' => $defaults['apply_excel'],
                'apply_csv' => $defaults['apply_csv'],
                'created_date' => now(),
                'modified_count' => 0,
                'is_active' => true,
                'is_deleted' => false,
            ]);
        }

        DocumentKonfig::forgetCache();
    }
}
