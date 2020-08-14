<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 17:45:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kategori_kegiatan', function (Blueprint $table) {
            $table->string('calendar_color', 7)->default('#2563eb')->after('deskripsi');
        });

        Schema::table('pengajian', function (Blueprint $table) {
            $table->foreignId('kategori_kegiatan_id')
                ->nullable()
                ->after('materi_id')
                ->constrained('kategori_kegiatan')
                ->nullOnDelete();
        });

        Schema::create('hari_libur', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->unique();
            $table->string('nama');
            $table->string('jenis', 32)->default('nasional');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hari_libur');

        Schema::table('pengajian', function (Blueprint $table) {
            $table->dropConstrainedForeignId('kategori_kegiatan_id');
        });

        Schema::table('kategori_kegiatan', function (Blueprint $table) {
            $table->dropColumn('calendar_color');
        });
    }
};
