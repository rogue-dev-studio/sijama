<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lokasi', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 50)->unique();
            $table->string('nama');
            $table->string('jenis', 32)->default('masjid');
            $table->string('kota', 100)->nullable();
            $table->text('alamat')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['jenis', 'is_active']);
            $table->index('kota');
        });

        Schema::create('pemateri', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 50)->unique();
            $table->string('nama');
            $table->string('kontak', 50)->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('materi', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 50)->unique();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('kategori_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 50)->unique();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('pengajian', function (Blueprint $table) {
            $table->foreignId('lokasi_id')->nullable()->after('lokasi')->constrained('lokasi')->nullOnDelete();
            $table->foreignId('pemateri_id')->nullable()->after('pemateri')->constrained('pemateri')->nullOnDelete();
            $table->foreignId('materi_id')->nullable()->after('pemateri_id')->constrained('materi')->nullOnDelete();
        });

        Schema::table('kegiatan', function (Blueprint $table) {
            $table->foreignId('lokasi_id')->nullable()->after('lokasi')->constrained('lokasi')->nullOnDelete();
            $table->foreignId('kategori_kegiatan_id')->nullable()->after('jenis')->constrained('kategori_kegiatan')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('kegiatan', function (Blueprint $table) {
            $table->dropConstrainedForeignId('lokasi_id');
            $table->dropConstrainedForeignId('kategori_kegiatan_id');
        });

        Schema::table('pengajian', function (Blueprint $table) {
            $table->dropConstrainedForeignId('lokasi_id');
            $table->dropConstrainedForeignId('pemateri_id');
            $table->dropConstrainedForeignId('materi_id');
        });

        Schema::dropIfExists('kategori_kegiatan');
        Schema::dropIfExists('materi');
        Schema::dropIfExists('pemateri');
        Schema::dropIfExists('lokasi');
    }
};
