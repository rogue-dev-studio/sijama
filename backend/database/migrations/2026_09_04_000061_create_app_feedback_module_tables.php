<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:55:00
 */

use Database\Migrations\Support\RunsSqlDefinitions;
use Database\Migrations\Support\SqliteSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    use RunsSqlDefinitions;

    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            $this->runSqlDefinition('app_feedback_module.sql');

            return;
        }

        SqliteSchema::createFeedbackModule();
    }

    public function down(): void
    {
        Schema::dropIfExists('app_poll_vote_t');
        Schema::dropIfExists('app_poll_option_t');
        Schema::dropIfExists('app_poll_t');
        Schema::dropIfExists('app_feedback_t');
        Schema::dropIfExists('app_report_t');
    }
};
