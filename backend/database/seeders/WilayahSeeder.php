<?php

namespace Database\Seeders;

use App\Models\Daerah;
use App\Models\Desa;
use App\Models\Kelompok;
use App\Models\Pusat;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WilayahSeeder extends Seeder
{
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

            $pusatTimur = Pusat::updateOrCreate(
                ['kode' => 'indonesia-timur'],
                [
                    'nama' => 'Indonesia Timur',
                    'deskripsi' => 'Wilayah fungsional pusat Indonesia Timur',
                    'is_active' => true,
                ]
            );

            Pusat::query()
                ->whereNotIn('kode', ['indonesia-barat', 'indonesia-timur'])
                ->delete();

            $bandungUtara = Daerah::updateOrCreate(
                ['kode' => 'bandung-utara'],
                [
                    'pusat_id' => $pusatBarat->id,
                    'nama' => 'Bandung Utara',
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );

            $bandungTimur = Daerah::updateOrCreate(
                ['kode' => 'bandung-timur'],
                [
                    'pusat_id' => $pusatBarat->id,
                    'nama' => 'Bandung Timur',
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );

            $makassarUtara = Daerah::updateOrCreate(
                ['kode' => 'makassar-utara'],
                [
                    'pusat_id' => $pusatTimur->id,
                    'nama' => 'Makassar Utara',
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );

            $bojonegara = Desa::updateOrCreate(
                ['kode' => 'bojonegara'],
                [
                    'daerah_id' => $bandungUtara->id,
                    'nama' => 'Bojonegara',
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );

            $cikutra = Desa::updateOrCreate(
                ['kode' => 'cikutra'],
                [
                    'daerah_id' => $bandungTimur->id,
                    'nama' => 'Cikutra',
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );

            $ujungPandang = Desa::updateOrCreate(
                ['kode' => 'ujung-pandang'],
                [
                    'daerah_id' => $makassarUtara->id,
                    'nama' => 'Ujung Pandang',
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );

            Kelompok::updateOrCreate(
                ['kode' => 'pajajaran-timur'],
                [
                    'desa_id' => $bojonegara->id,
                    'nama' => 'Pajajaran Timur',
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );

            Kelompok::updateOrCreate(
                ['kode' => 'pajajaran-barat'],
                [
                    'desa_id' => $bojonegara->id,
                    'nama' => 'Pajajaran Barat',
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );

            Kelompok::updateOrCreate(
                ['kode' => 'babakan-jeruk'],
                [
                    'desa_id' => $cikutra->id,
                    'nama' => 'Babakan Jeruk',
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );

            Kelompok::updateOrCreate(
                ['kode' => 'losari'],
                [
                    'desa_id' => $ujungPandang->id,
                    'nama' => 'Losari',
                    'deskripsi' => null,
                    'is_active' => true,
                ]
            );
        });
    }
}
