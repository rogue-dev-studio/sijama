<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:04:27
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 15:04:27
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lokasi', function (Blueprint $table) {
            $table->text('maps_url')->nullable()->after('maps_place_name');
        });
    }

    public function down(): void
    {
        Schema::table('lokasi', function (Blueprint $table) {
            $table->dropColumn('maps_url');
        });
    }
};
