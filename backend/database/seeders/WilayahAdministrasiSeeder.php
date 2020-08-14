<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 18:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-02 18:25:00
 */

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Full national wilayah administrasi (Kepmendagri 2025 via lokabisa-oss/region-id).
 */
class WilayahAdministrasiSeeder extends Seeder
{
    private const CHUNK = 500;

    public function run(): void
    {
        $base = database_path('data/wilayah');
        foreach (['provinces.csv', 'regencies.csv', 'districts.csv', 'villages.csv'] as $file) {
            if (! is_file($base.DIRECTORY_SEPARATOR.$file)) {
                throw new RuntimeException("Wilayah data missing: {$file}");
            }
        }

        $existing = (int) DB::table('adm_desa_kelurahan')->count();
        if ($existing > 1000 && ! filter_var(env('FORCE_WILAYAH_ADM_SEED', false), FILTER_VALIDATE_BOOLEAN)) {
            $this->command?->info("Wilayah administrasi sudah ada ({$existing} desa/kel). Skip. Set FORCE_WILAYAH_ADM_SEED=1 untuk impor ulang.");

            return;
        }

        $now = now();

        DB::table('desa')->update(['adm_desa_kelurahan_id' => null]);
        DB::table('adm_kode_pos')->delete();
        DB::table('adm_desa_kelurahan')->delete();
        DB::table('adm_kecamatan')->delete();
        DB::table('adm_kabupaten_kota')->delete();
        DB::table('adm_provinsi')->delete();
        DB::table('adm_negara')->delete();

        $negaraId = DB::table('adm_negara')->insertGetId([
            'kode' => 'ID',
            'nama' => 'Indonesia',
            'iso3' => 'IDN',
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $provinsiMap = [];
        foreach ($this->readCsv($base.'/provinces.csv') as $row) {
            $kode = $this->toDotted((string) $row['code']);
            $id = DB::table('adm_provinsi')->insertGetId([
                'negara_id' => $negaraId,
                'kode' => $kode,
                'nama' => trim((string) $row['name']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $provinsiMap[(string) $row['code']] = $id;
        }

        $this->command?->info('Provinsi: '.count($provinsiMap));

        $kabupatenMap = [];
        $kabRows = [];
        foreach ($this->readCsv($base.'/regencies.csv') as $row) {
            $provinceCode = (string) $row['province_code'];
            if (! isset($provinsiMap[$provinceCode])) {
                continue;
            }
            $jenis = strtolower((string) ($row['type'] ?? 'regency')) === 'city' ? 'kota' : 'kabupaten';
            $kabRows[] = [
                'provinsi_id' => $provinsiMap[$provinceCode],
                'kode' => $this->toDotted((string) $row['code']),
                'nama' => trim((string) $row['name']),
                'jenis' => $jenis,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
                '_raw' => (string) $row['code'],
            ];
        }

        foreach (array_chunk($kabRows, self::CHUNK) as $chunk) {
            $insert = array_map(static function (array $row): array {
                unset($row['_raw']);

                return $row;
            }, $chunk);
            DB::table('adm_kabupaten_kota')->insert($insert);
        }

        foreach (DB::table('adm_kabupaten_kota')->get(['id', 'kode']) as $item) {
            $kabupatenMap[$this->fromDotted($item->kode)] = $item->id;
        }

        $this->command?->info('Kabupaten/Kota: '.count($kabupatenMap));

        $kecamatanMap = [];
        $kecRows = [];
        foreach ($this->readCsv($base.'/districts.csv') as $row) {
            $regencyCode = (string) $row['regency_code'];
            if (! isset($kabupatenMap[$regencyCode])) {
                continue;
            }
            $kecRows[] = [
                'kabupaten_kota_id' => $kabupatenMap[$regencyCode],
                'kode' => $this->toDotted((string) $row['code']),
                'nama' => trim((string) $row['name']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
                '_raw' => (string) $row['code'],
            ];
        }

        foreach (array_chunk($kecRows, self::CHUNK) as $chunk) {
            $insert = array_map(static function (array $row): array {
                unset($row['_raw']);

                return $row;
            }, $chunk);
            DB::table('adm_kecamatan')->insert($insert);
        }

        foreach (DB::table('adm_kecamatan')->get(['id', 'kode']) as $item) {
            $kecamatanMap[$this->fromDotted($item->kode)] = $item->id;
        }

        $this->command?->info('Kecamatan: '.count($kecamatanMap));

        $desaBuffer = [];
        $desaCount = 0;
        foreach ($this->readCsv($base.'/villages.csv') as $row) {
            $districtCode = (string) $row['district_code'];
            if (! isset($kecamatanMap[$districtCode])) {
                continue;
            }
            $type = strtolower((string) ($row['type'] ?? 'village'));
            $jenis = $type === 'urban_village' ? 'kelurahan' : 'desa';
            $desaBuffer[] = [
                'kecamatan_id' => $kecamatanMap[$districtCode],
                'kode' => $this->toDotted((string) $row['code']),
                'nama' => trim((string) $row['name']),
                'jenis' => $jenis,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
            if (count($desaBuffer) >= self::CHUNK) {
                DB::table('adm_desa_kelurahan')->insert($desaBuffer);
                $desaCount += count($desaBuffer);
                $desaBuffer = [];
            }
        }
        if ($desaBuffer !== []) {
            DB::table('adm_desa_kelurahan')->insert($desaBuffer);
            $desaCount += count($desaBuffer);
        }

        $this->command?->info("Desa/Kelurahan: {$desaCount}");
    }

    /**
     * @return \Generator<int, array<string, string>>
     */
    private function readCsv(string $path): \Generator
    {
        $handle = fopen($path, 'rb');
        if ($handle === false) {
            throw new RuntimeException("Cannot open {$path}");
        }

        try {
            $header = fgetcsv($handle);
            if ($header === false) {
                return;
            }
            $header = array_map(static fn ($value) => trim((string) $value), $header);
            while (($row = fgetcsv($handle)) !== false) {
                if ($row === [null] || $row === false) {
                    continue;
                }
                $assoc = [];
                foreach ($header as $index => $key) {
                    $assoc[$key] = isset($row[$index]) ? (string) $row[$index] : '';
                }
                yield $assoc;
            }
        } finally {
            fclose($handle);
        }
    }

    private function toDotted(string $code): string
    {
        $code = preg_replace('/\D+/', '', $code) ?? $code;
        $len = strlen($code);
        if ($len <= 2) {
            return $code;
        }
        if ($len === 4) {
            return substr($code, 0, 2).'.'.substr($code, 2, 2);
        }
        if ($len === 6) {
            return substr($code, 0, 2).'.'.substr($code, 2, 2).'.'.substr($code, 4, 2);
        }
        if ($len >= 10) {
            return substr($code, 0, 2).'.'.substr($code, 2, 2).'.'.substr($code, 4, 2).'.'.substr($code, 6, 4);
        }

        return $code;
    }

    private function fromDotted(string $kode): string
    {
        return str_replace('.', '', $kode);
    }
}
