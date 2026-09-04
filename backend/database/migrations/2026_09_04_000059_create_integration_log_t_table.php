<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 15:51:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 15:51:00
 */

use Database\Migrations\Support\RunsSqlDefinitions;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    use RunsSqlDefinitions;

    public function up(): void
    {
        $this->createFromDefinition('integration_log_t');
    }

    public function down(): void
    {
        $this->dropTable('integration_log_t');
    }
};
