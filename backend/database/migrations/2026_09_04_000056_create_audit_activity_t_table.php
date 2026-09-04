<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 14:10:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 14:10:53
 */

use Database\Migrations\Support\RunsSqlDefinitions;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    use RunsSqlDefinitions;

    public function up(): void
    {
        $this->createFromDefinition('audit_activity_t');
    }

    public function down(): void
    {
        $this->dropTable('audit_activity_t');
    }
};
