<?php

namespace Database\Seeders;

use App\Models\Daerah;
use App\Models\Desa;
use App\Models\Kelompok;
use App\Models\Pusat;
use App\Models\SubKelompok;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WilayahSeeder extends Seeder
{
    private const KELOMPOK_SINGKATAN = [
        'Pajajaran Timur' => 'PJT',
        'Pajajaran Barat' => 'PJB',
    ];

    public function run(): void
    {
        DB::transaction(function () {
            $pusatBarat = Pusat::updateOrCreate(
                ['kode' => 'indonesia-barat'],
                [
                    'nama' => 'Indonesia Barat',
                    'deskripsi' => 'Wilayah fungsional pusat Indonesia Barat',
                    'is_active' => true,
                ]
            );

            Pusat::query()
                ->whereKeyNot($pusatBarat->id)
                ->delete();

            $bandungUtara = Daerah::updateOrCreate(
                ['kode' => '05'],
                [
                    'wilayah_fung_pusat_id' => $pusatBarat->id,
                    'nama' => 'Bandung Utara',
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );

            $keepDesaIds = [];
            $keepKelompokIds = [];

            foreach ($this->desaDefinitions() as $desaDefinition) {
                $desa = Desa::updateOrCreate(
                    [
                        'wilayah_fung_daerah_id' => $bandungUtara->id,
                        'kode' => $desaDefinition['kode'],
                    ],
                    [
                        'nama' => $desaDefinition['nama'],
                        'deskripsi' => null,
                        'is_active' => true,
                    ]
                );

                $keepDesaIds[] = $desa->id;

                foreach ($desaDefinition['kelompok'] as $kelompokNama) {
                    $kelompok = Kelompok::updateOrCreate(
                        [
                            'wilayah_fung_desa_id' => $desa->id,
                            'nama' => $kelompokNama,
                        ],
                        [
                            'kode' => null,
                            'singkatan' => self::KELOMPOK_SINGKATAN[$kelompokNama] ?? null,
                            'deskripsi' => null,
                            'is_active' => true,
                        ]
                    );

                    $keepKelompokIds[] = $kelompok->id;
                }
            }

            $this->purgeLegacyWilayah($bandungUtara->id, $keepDesaIds, $keepKelompokIds);
        });

        $this->call(DemoUsersSeeder::class);
    }

    /**
     * @return list<array{kode: string, nama: string, kelompok: list<string>}>
     */
    private function desaDefinitions(): array
    {
        return [
            [
                'kode' => '01',
                'nama' => 'Cipaganti',
                'kelompok' => ['Bijaksana', 'Darul Ulya', 'Cimbuleuit', 'Sukajadi'],
            ],
            [
                'kode' => '02',
                'nama' => 'Bojonegara',
                'kelompok' => [
                    'Sukawarna',
                    'Babakan Jeruk',
                    'Sukagalih',
                    'Sukaraja',
                    'Citepus',
                    'Pajajaran Barat',
                    'Pajajaran Timur',
                ],
            ],
            [
                'kode' => '03',
                'nama' => 'Setiabudi',
                'kelompok' => ['Gerlong', 'Sarikaso', 'Girang', 'Mustika'],
            ],
            [
                'kode' => '04',
                'nama' => 'Sarijadi',
                'kelompok' => [
                    'Sarijadi Timur',
                    'Sarijadi Barat',
                    'Gunung Batu Timur',
                    'Gunung Batu Barat',
                ],
            ],
            [
                'kode' => '05',
                'nama' => 'Dago',
                'kelompok' => [
                    'Dago Asri',
                    'Dago Pojok Dalam',
                    'Dago Pojok Luar',
                    'Tubagus',
                    'Manteos',
                ],
            ],
            [
                'kode' => '06',
                'nama' => 'Cibeunying',
                'kelompok' => ['Perumnas', 'Gagak', 'Gagak Barat', 'Sadang Serang', 'Sukma'],
            ],
            [
                'kode' => '07',
                'nama' => 'Cikutra',
                'kelompok' => [
                    'Sadang Serang Timur',
                    'Cibeunying Raya',
                    'Bojong Kaler',
                    'Bojong Kacor',
                    'Neglasari',
                    'Babakan Baru',
                ],
            ],
            [
                'kode' => '08',
                'nama' => 'Parongpong',
                'kelompok' => ['Panyairan', 'Kancah', 'Karyawangi', 'Cikahuripan'],
            ],
            [
                'kode' => '09',
                'nama' => 'Lembang',
                'kelompok' => ['Cibogo', 'Dancer', 'Cijeruk', 'Panorama', 'Mutiara'],
            ],
            [
                'kode' => '10',
                'nama' => 'Langensari',
                'kelompok' => ['Cibodas', 'Maribaya', 'Sukamaju', 'Sukamulya'],
            ],
        ];
    }

    /**
     * @param  list<int>  $keepDesaIds
     * @param  list<int>  $keepKelompokIds
     */
    private function purgeLegacyWilayah(int $keepDaerahId, array $keepDesaIds, array $keepKelompokIds): void
    {
        $legacyKelompokQuery = Kelompok::query()->whereNotIn('id', $keepKelompokIds);
        $legacyKelompokIds = $legacyKelompokQuery->pluck('id')->all();

        if ($legacyKelompokIds !== []) {
            SubKelompok::query()->whereIn('wilayah_fung_kelompok_id', $legacyKelompokIds)->delete();
            User::query()->whereIn('wilayah_fung_kelompok_id', $legacyKelompokIds)->update(['wilayah_fung_kelompok_id' => null]);
            $legacyKelompokQuery->whereDoesntHave('jamaah')->delete();
        }

        $legacyDesaQuery = Desa::query()->whereNotIn('id', $keepDesaIds);
        $legacyDesaIds = $legacyDesaQuery->pluck('id')->all();

        if ($legacyDesaIds !== []) {
            User::query()->whereIn('wilayah_fung_desa_id', $legacyDesaIds)->update(['wilayah_fung_desa_id' => null]);
            $legacyDesaQuery->delete();
        }

        Daerah::query()->whereKeyNot($keepDaerahId)->delete();
    }
}
