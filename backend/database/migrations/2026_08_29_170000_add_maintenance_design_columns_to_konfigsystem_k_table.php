<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->string('path_maintenance_background', 500)->nullable()->after('maintenance_message');
            $table->string('maintenance_background_style', 20)->default('cover')->after('path_maintenance_background');
            $table->string('maintenance_background_repeat_size', 20)->default('28px')->after('maintenance_background_style');
        });
    }

    public function down(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->dropColumn([
                'path_maintenance_background',
                'maintenance_background_style',
                'maintenance_background_repeat_size',
            ]);
        });
    }
};
