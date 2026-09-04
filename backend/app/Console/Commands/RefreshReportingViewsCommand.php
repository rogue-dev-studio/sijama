<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 22:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 22:05:00
 */

namespace App\Console\Commands;

use App\Services\ReportingViewService;
use Illuminate\Console\Command;

class RefreshReportingViewsCommand extends Command
{
    protected $signature = 'reporting:refresh-views';

    protected $description = 'Refresh materialized views untuk dashboard dan laporan';

    public function handle(ReportingViewService $reportingViewService): int
    {
        if (! $reportingViewService->isEnabled()) {
            $this->warn('Reporting materialized views tidak tersedia (hanya PostgreSQL).');

            return self::SUCCESS;
        }

        $reportingViewService->refresh();
        $this->info('Materialized views berhasil di-refresh.');

        return self::SUCCESS;
    }
}
