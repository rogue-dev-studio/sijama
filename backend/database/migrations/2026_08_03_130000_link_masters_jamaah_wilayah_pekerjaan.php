<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:06:41
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:06:41
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pekerjaan', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 50)->unique();
            $table->string('nama', 100);
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('jamaah', function (Blueprint $table) {
            $table->foreignId('pekerjaan_id')
                ->nullable()
                ->after('pekerjaan')
                ->constrained('pekerjaan')
                ->nullOnDelete();
        });

        Schema::table('lokasi', function (Blueprint $table) {
            $table->foreignId('adm_desa_kelurahan_id')
                ->nullable()
                ->after('kota')
                ->constrained('adm_desa_kelurahan')
                ->nullOnDelete();
        });

        Schema::table('pemateri', function (Blueprint $table) {
            $table->foreignId('jamaah_id')
                ->nullable()
                ->after('kode')
                ->constrained('jamaah')
                ->nullOnDelete();
            $table->unique('jamaah_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('jamaah_id')
                ->nullable()
                ->after('dapukan_id')
                ->constrained('jamaah')
                ->nullOnDelete();
            $table->unique('jamaah_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('jamaah_id');
        });

        Schema::table('pemateri', function (Blueprint $table) {
            $table->dropConstrainedForeignId('jamaah_id');
        });

        Schema::table('lokasi', function (Blueprint $table) {
            $table->dropConstrainedForeignId('adm_desa_kelurahan_id');
        });

        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pekerjaan_id');
        });

        Schema::dropIfExists('pekerjaan');
    }
};
