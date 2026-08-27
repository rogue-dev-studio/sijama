<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:54:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:54:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->boolean('background_pattern')->default(true)->after('path_background');
        });
    }

    public function down(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->dropColumn('background_pattern');
        });
    }
};
