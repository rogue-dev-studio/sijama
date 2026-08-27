<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 12:19:21
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:19:21
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->string('background_repeat_size', 20)->default('28px')->after('background_style');
        });
    }

    public function down(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->dropColumn('background_repeat_size');
        });
    }
};
