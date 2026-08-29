<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 15:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:15:00
 */

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Kode pos nasional dari lokabisa-oss/postal-code-id (region-id + Pos Indonesia lookup).
 *
 * Sumber: https://github.com/lokabisa-oss/postal-code-id/releases/tag/v2026Q1
 * File: postal_codes_pos_indonesia.csv → salin ke database/data/wilayah/postal_codes.csv
 */
class KodePosSeeder extends Seeder
{
    private const CHUNK = 1000;

    public function run(): void
    {
        $path = database_path('data/wilayah/postal_codes.csv');
        if (! is_file($path)) {
            $this->command?->warn('Skip KodePosSeeder: postal_codes.csv tidak ada. Jalankan scripts/fetch-postal-codes.ps1');

            return;
        }

        $existing = (int) DB::table('adm_kode_pos')->count();
        if ($existing > 1000 && ! filter_var(env('FORCE_KODE_POS_SEED', false), FILTER_VALIDATE_BOOLEAN)) {
            $this->command?->info("Kode pos sudah ada ({$existing} baris). Skip. Set FORCE_KODE_POS_SEED=1 untuk impor ulang.");

            return;
        }

        if ((int) DB::table('adm_desa_kelurahan')->count() < 1000) {
            throw new RuntimeException('Jalankan WilayahAdministrasiSeeder terlebih dahulu.');
        }

        $desaMap = [];
        foreach (DB::table('adm_desa_kelurahan')->get(['id', 'kode', 'kecamatan_id']) as $row) {
            $desaMap[$this->fromDotted((string) $row->kode)] = [
                'id' => (int) $row->id,
                'kecamatan_id' => (int) $row->kecamatan_id,
            ];
        }

        DB::table('adm_kode_pos')->delete();

        $now = now();
        $buffer = [];
        $inserted = 0;
        $skipped = 0;

        foreach ($this->readCsv($path) as $row) {
            $postalCode = trim((string) ($row['postal_code'] ?? ''));
            $villageCode = trim((string) ($row['village_code'] ?? ''));
            $status = strtoupper(trim((string) ($row['status'] ?? '')));

            if ($postalCode === '' || $status === 'UNASSIGNED' || ! preg_match('/^\d{5}$/', $postalCode)) {
                $skipped++;

                continue;
            }

            if (! isset($desaMap[$villageCode])) {
                $skipped++;

                continue;
            }

            $desa = $desaMap[$villageCode];
            $buffer[] = [
                'kode' => $postalCode,
                'desa_kelurahan_id' => $desa['id'],
                'kecamatan_id' => $desa['kecamatan_id'],
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($buffer) >= self::CHUNK) {
                DB::table('adm_kode_pos')->insert($buffer);
                $inserted += count($buffer);
                $buffer = [];
            }
        }

        if ($buffer !== []) {
            DB::table('adm_kode_pos')->insert($buffer);
            $inserted += count($buffer);
        }

        $this->command?->info("Kode pos: {$inserted} baris diimpor, {$skipped} baris dilewati.");
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

    private function fromDotted(string $kode): string
    {
        return str_replace('.', '', $kode);
    }
}
