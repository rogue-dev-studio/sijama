<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 12:28:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:28:00
 */

namespace Database\Seeders;

use App\Models\LookupM;
use App\Support\JamaahPendidikan;
use App\Support\JamaahStatusPernikahan;
use App\Support\LookupTypes;
use Illuminate\Database\Seeder;

class LookupMSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            LookupTypes::JENIS_KELAMIN => [
                ['lookup_value' => 'L', 'lookup_name' => 'Laki-laki', 'lookup_kode' => 'L'],
                ['lookup_value' => 'P', 'lookup_name' => 'Perempuan', 'lookup_kode' => 'P'],
            ],
            LookupTypes::GOLONGAN_DARAH => [
                ['lookup_value' => 'A', 'lookup_name' => 'A', 'lookup_kode' => 'A'],
                ['lookup_value' => 'B', 'lookup_name' => 'B', 'lookup_kode' => 'B'],
                ['lookup_value' => 'AB', 'lookup_name' => 'AB', 'lookup_kode' => 'AB'],
                ['lookup_value' => 'O', 'lookup_name' => 'O', 'lookup_kode' => 'O'],
                ['lookup_value' => 'tidak_tahu', 'lookup_name' => 'Tidak tahu', 'lookup_kode' => 'TT'],
            ],
            LookupTypes::STATUS_PERNIKAHAN => collect(JamaahStatusPernikahan::LABELS)
                ->map(fn (string $label, string $value) => [
                    'lookup_value' => $value,
                    'lookup_name' => $label,
                    'lookup_kode' => $value,
                ])
                ->values()
                ->all(),
            LookupTypes::PENDIDIKAN => collect(JamaahPendidikan::LABELS)
                ->map(fn (string $label, string $value) => [
                    'lookup_value' => $value,
                    'lookup_name' => $label,
                    'lookup_kode' => $value,
                ])
                ->values()
                ->all(),
            LookupTypes::PEKERJAAN => [
                ['lookup_value' => 'pns_asn', 'lookup_name' => 'PNS / ASN', 'lookup_kode' => 'PNS'],
                ['lookup_value' => 'tni_polri', 'lookup_name' => 'TNI / Polri', 'lookup_kode' => 'TNI'],
                ['lookup_value' => 'karyawan_swasta', 'lookup_name' => 'Karyawan swasta', 'lookup_kode' => 'KSW'],
                ['lookup_value' => 'wiraswasta', 'lookup_name' => 'Wiraswasta', 'lookup_kode' => 'WIRA'],
                ['lookup_value' => 'petani', 'lookup_name' => 'Petani', 'lookup_kode' => 'PTN'],
                ['lookup_value' => 'nelayan', 'lookup_name' => 'Nelayan', 'lookup_kode' => 'NEL'],
                ['lookup_value' => 'buruh', 'lookup_name' => 'Buruh', 'lookup_kode' => 'BRH'],
                ['lookup_value' => 'guru', 'lookup_name' => 'Guru', 'lookup_kode' => 'GRU'],
                ['lookup_value' => 'dosen', 'lookup_name' => 'Dosen', 'lookup_kode' => 'DSN'],
                ['lookup_value' => 'tenaga_kesehatan', 'lookup_name' => 'Tenaga kesehatan', 'lookup_kode' => 'KES'],
                ['lookup_value' => 'mahasiswa', 'lookup_name' => 'Mahasiswa', 'lookup_kode' => 'MHS'],
                ['lookup_value' => 'pelajar', 'lookup_name' => 'Pelajar', 'lookup_kode' => 'PLJ'],
                ['lookup_value' => 'ibu_rumah_tangga', 'lookup_name' => 'Ibu rumah tangga', 'lookup_kode' => 'IRT'],
                ['lookup_value' => 'pensiunan', 'lookup_name' => 'Pensiunan', 'lookup_kode' => 'PEN'],
                ['lookup_value' => 'tidak_bekerja', 'lookup_name' => 'Tidak bekerja', 'lookup_kode' => 'TB'],
                ['lookup_value' => 'lainnya', 'lookup_name' => 'Lainnya', 'lookup_kode' => 'LL'],
            ],
        ];

        foreach ($groups as $type => $items) {
            foreach (array_values($items) as $index => $item) {
                LookupM::query()->updateOrCreate(
                    [
                        'lookup_type' => $type,
                        'lookup_value' => $item['lookup_value'],
                        'is_deleted' => false,
                    ],
                    [
                        'lookup_name' => $item['lookup_name'],
                        'lookup_kode' => $item['lookup_kode'] ?? null,
                        'lookup_urutan' => $index + 1,
                        'is_active' => true,
                        'created_date' => now(),
                        'modified_count' => 0,
                    ]
                );
            }
        }
    }
}
