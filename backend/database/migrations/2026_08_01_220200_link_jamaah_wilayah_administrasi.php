<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:46:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:46:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->foreignId('adm_desa_kelurahan_id')
                ->nullable()
                ->after('kelompok_id')
                ->constrained('adm_desa_kelurahan')
                ->nullOnDelete();
            $table->string('kode_pos', 10)->nullable()->after('rw');
            $table->index('adm_desa_kelurahan_id');
            $table->index('kode_pos');
        });
    }

    public function down(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropConstrainedForeignId('adm_desa_kelurahan_id');
            $table->dropColumn('kode_pos');
        });
    }
};
