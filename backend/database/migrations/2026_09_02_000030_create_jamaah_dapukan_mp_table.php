<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 10:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:50:00
 */

use Database\Migrations\Support\RunsSqlDefinitions;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    use RunsSqlDefinitions;

    public function up(): void
    {
        $this->createFromDefinition('jamaah_dapukan_mp');
    }

    public function down(): void
    {
        $this->dropTable('jamaah_dapukan_mp');
    }
};
