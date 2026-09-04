<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 18:10:00
 */

namespace App\Console\Commands;

use App\Services\KegiatanRutinGeneratorService;
use Illuminate\Console\Command;

class GenerateKegiatanRutinCommand extends Command
{
    protected $signature = 'kegiatan:generate-rutin';

    protected $description = 'Generate kegiatan instances from active recurring schedules';

    public function handle(KegiatanRutinGeneratorService $generatorService): int
    {
        $created = $generatorService->syncAllActive();

        $this->info("Kegiatan rutin dibuat: {$created}");

        return self::SUCCESS;
    }
}
