<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 15:51:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:20:00
 */

namespace App\Console\Commands;

use App\Services\IntegrationLogService;
use Illuminate\Console\Command;

class IntegrationsHealthCheckCommand extends Command
{
    protected $signature = 'integrations:health-check {--expiry-only : Hanya cek masa berlaku}';

    protected $description = 'Catat peringatan masa berlaku integrasi dan (opsional) cek konektivitas database';

    public function handle(IntegrationLogService $integrationLogService): int
    {
        $expiry = $integrationLogService->runExpirySweep();
        $this->info('Expiry sweep recorded: '.$expiry['recorded']);

        if (! $this->option('expiry-only')) {
            $database = $integrationLogService->checkConnectivity('database');
            $this->info('Database check: '.$database['status'].' — '.$database['message']);
        }

        return self::SUCCESS;
    }
}
