<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 13:36:09
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 13:36:09
 */

use Database\Migrations\Support\RunsSqlDefinitions;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    use RunsSqlDefinitions;

    public function up(): void
    {
        $this->createFromDefinition('audit_login_t');
    }

    public function down(): void
    {
        $this->dropTable('audit_login_t');
    }
};
