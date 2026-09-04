<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 11:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 12:00:00
 */

use Database\Migrations\Support\RunsSqlDefinitions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    use RunsSqlDefinitions;

    public function up(): void
    {
        $this->createReportingObjectFromDefinition('refresh_reporting_fn');
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('DROP FUNCTION IF EXISTS refresh_reporting_fn()');
    }
};
