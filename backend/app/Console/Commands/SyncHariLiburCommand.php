<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 17:50:00
 */

namespace App\Console\Commands;

use App\Services\ApiCoIdHolidayService;
use Illuminate\Console\Command;
use RuntimeException;

class SyncHariLiburCommand extends Command
{
    protected $signature = 'hari-libur:sync
                            {--year= : Tahun spesifik (default: tahun berjalan)}
                            {--next : Sertakan tahun berikutnya}';

    protected $description = 'Sinkronkan hari libur nasional & cuti bersama dari api.co.id ke hari_libur_m';

    public function handle(ApiCoIdHolidayService $service): int
    {
        $years = $this->resolveYears();
        if ($years === []) {
            $this->error('Tahun tidak valid.');

            return self::FAILURE;
        }

        try {
            $results = $service->syncYears($years);
        } catch (RuntimeException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        foreach ($results as $result) {
            $this->info(sprintf(
                'Tahun %d: %d hari libur disinkronkan.',
                $result['year'],
                $result['synced'],
            ));
        }

        return self::SUCCESS;
    }

    /**
     * @return list<int>
     */
    private function resolveYears(): array
    {
        $yearOption = $this->option('year');
        if (is_string($yearOption) && $yearOption !== '') {
            $year = (int) $yearOption;
            if ($year < 1) {
                return [];
            }

            return [$year];
        }

        $years = [now()->year];
        if ($this->option('next')) {
            $years[] = now()->year + 1;
        }

        return array_values(array_unique($years));
    }
}
