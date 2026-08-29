<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 15:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:15:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('adm_kode_pos', function (Blueprint $table) {
            $table->dropColumn('nama_wilayah');
        });
    }

    public function down(): void
    {
        Schema::table('adm_kode_pos', function (Blueprint $table) {
            $table->string('nama_wilayah')->nullable()->after('kecamatan_id');
        });
    }
};
