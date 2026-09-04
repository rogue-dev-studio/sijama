<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 11:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 11:20:00
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
        $this->createReportingObjectFromDefinition('jamaah_wilayah_v');
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('DROP VIEW IF EXISTS jamaah_wilayah_v');
    }
};
