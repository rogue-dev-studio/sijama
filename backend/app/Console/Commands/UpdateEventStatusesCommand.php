<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 17:50:00
 */

namespace App\Console\Commands;

use App\Services\EventStatusService;
use Illuminate\Console\Command;

class UpdateEventStatusesCommand extends Command
{
    protected $signature = 'events:update-statuses';

    protected $description = 'Update status kegiatan/pengajian berdasarkan tanggal dan jam';

    public function handle(EventStatusService $eventStatusService): int
    {
        $result = $eventStatusService->sync();

        $this->info(sprintf(
            'Kegiatan ongoing=%d completed=%d · Pengajian completed=%d',
            $result['kegiatan_ongoing'],
            $result['kegiatan_completed'],
            $result['pengajian_completed'],
        ));

        return self::SUCCESS;
    }
}
