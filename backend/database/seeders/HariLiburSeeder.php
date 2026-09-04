<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 17:50:00
 */

namespace Database\Seeders;

use App\Models\HariLibur;
use App\Services\ApiCoIdHolidayService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class HariLiburSeeder extends Seeder
{
    public function run(ApiCoIdHolidayService $holidayService): void
    {
        $apiKey = (string) config('integrations.api_co_id.api_key');
        if ($apiKey !== '') {
            try {
                $holidayService->syncYears([now()->year, now()->year + 1]);

                return;
            } catch (RuntimeException $exception) {
                Log::warning('HariLiburSeeder: sync api.co.id gagal, fallback seed minimal.', [
                    'message' => $exception->getMessage(),
                ]);
            }
        }

        $years = [now()->year, now()->year + 1];
        foreach ($years as $year) {
            foreach ($this->fallbackHolidaysForYear($year) as $row) {
                HariLibur::updateOrCreate(
                    ['tanggal' => $row['tanggal']],
                    [
                        'nama' => $row['nama'],
                        'jenis' => $row['jenis'],
                        'is_active' => true,
                    ],
                );
            }
        }
    }

    /**
     * @return list<array{tanggal: string, nama: string, jenis: string}>
     */
    private function fallbackHolidaysForYear(int $year): array
    {
        return [
            ['tanggal' => "{$year}-01-01", 'nama' => 'Tahun Baru Masehi', 'jenis' => 'nasional'],
            ['tanggal' => "{$year}-05-01", 'nama' => 'Hari Buruh Internasional', 'jenis' => 'nasional'],
            ['tanggal' => "{$year}-06-01", 'nama' => 'Hari Lahir Pancasila', 'jenis' => 'nasional'],
            ['tanggal' => "{$year}-08-17", 'nama' => 'Hari Kemerdekaan RI', 'jenis' => 'nasional'],
            ['tanggal' => "{$year}-12-25", 'nama' => 'Hari Raya Natal', 'jenis' => 'nasional'],
        ];
    }
}
