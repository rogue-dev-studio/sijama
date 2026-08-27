<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:45:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->string('path_background', 500)->nullable()->after('path_logofooter');
            $table->string('color_bg', 7)->nullable()->after('path_background');
            $table->string('color_surface', 7)->nullable()->after('color_bg');
            $table->string('color_ink', 7)->nullable()->after('color_surface');
            $table->string('color_accent', 7)->nullable()->after('color_ink');
            $table->string('color_accent_soft', 7)->nullable()->after('color_accent');
            $table->string('color_muted', 7)->nullable()->after('color_accent_soft');
            $table->string('color_border', 7)->nullable()->after('color_muted');
            $table->string('theme_color', 7)->nullable()->after('color_border');
        });
    }

    public function down(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->dropColumn([
                'path_background',
                'color_bg',
                'color_surface',
                'color_ink',
                'color_accent',
                'color_accent_soft',
                'color_muted',
                'color_border',
                'theme_color',
            ]);
        });
    }
};
