<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 14:53:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 14:53:59
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lokasi', function (Blueprint $table) {
            $table->string('maps_place_id', 120)->nullable()->after('lng');
            $table->string('maps_place_name', 255)->nullable()->after('maps_place_id');
        });
    }

    public function down(): void
    {
        Schema::table('lokasi', function (Blueprint $table) {
            $table->dropColumn(['maps_place_id', 'maps_place_name']);
        });
    }
};
