<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:59:30
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:59:30
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
            $table->string('nama');
            $table->string('jenis', 32)->default('masjid');
            $table->string('kota', 100)->nullable();
            $table->foreignId('adm_desa_kelurahan_id')
                ->nullable()
                ->constrained('adm_desa_kelurahan')
                ->nullOnDelete();
            $table->text('alamat')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('maps_place_id', 120)->nullable();
            $table->string('maps_place_name', 255)->nullable();
            $table->text('maps_url')->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['jenis', 'is_active']);
            $table->index('kota');
        });

        Schema::create('pemateri', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jamaah_id')->nullable()->constrained('jamaah')->nullOnDelete();
            $table->string('nama');
            $table->string('kontak', 50)->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique('jamaah_id');
        });

        Schema::create('materi', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('kategori_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->string('calendar_color', 7)->default('#2563eb');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('pengajian', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->string('pemateri')->nullable();
            $table->foreignId('pemateri_id')->nullable()->constrained('pemateri')->nullOnDelete();
            $table->string('lokasi')->nullable();
            $table->foreignId('lokasi_id')->nullable()->constrained('lokasi')->nullOnDelete();
            $table->foreignId('materi_id')->nullable()->constrained('materi')->nullOnDelete();
            $table->foreignId('kategori_kegiatan_id')->nullable()->constrained('kategori_kegiatan')->nullOnDelete();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->text('catatan')->nullable();
            $table->string('status')->default('scheduled');
            $table->timestamps();
            $table->index(['status', 'starts_at']);
        });

        Schema::create('kegiatan', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->string('jenis')->nullable();
            $table->foreignId('kategori_kegiatan_id')->nullable()->constrained('kategori_kegiatan')->nullOnDelete();
            $table->date('tanggal');
            $table->string('lokasi')->nullable();
            $table->foreignId('lokasi_id')->nullable()->constrained('lokasi')->nullOnDelete();
            $table->text('deskripsi')->nullable();
            $table->string('status')->default('planned');
            $table->timestamps();
            $table->index(['status', 'tanggal']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kegiatan');
        Schema::dropIfExists('pengajian');
        Schema::dropIfExists('kategori_kegiatan');
        Schema::dropIfExists('materi');
        Schema::dropIfExists('pemateri');
        Schema::dropIfExists('lokasi');
    }
};
