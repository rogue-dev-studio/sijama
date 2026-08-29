<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('keluarga', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelompok_id')->constrained('kelompok')->restrictOnDelete();
            $table->foreignId('kepala_jamaah_id')->nullable()->constrained('jamaah')->nullOnDelete();
            $table->string('no_kk', 16)->nullable()->index();
            $table->text('alamat')->nullable();
            $table->string('rt', 10)->nullable();
            $table->string('rw', 10)->nullable();
            $table->foreignId('adm_desa_kelurahan_id')
                ->nullable()
                ->constrained('adm_desa_kelurahan')
                ->nullOnDelete();
            $table->string('kode_pos', 10)->nullable()->index();
            $table->text('catatan')->nullable();
            $table->string('status', 20)->default('aktif')->index();
            $table->timestamps();
            $table->softDeletes();
            $table->index('kelompok_id');
        });

        Schema::create('jamaah_keluarga', function (Blueprint $table) {
            $table->id();
            $table->foreignId('keluarga_id')->constrained('keluarga')->cascadeOnDelete();
            $table->foreignId('jamaah_id')->constrained('jamaah')->restrictOnDelete();
            $table->string('hubungan_keluarga', 32);
            $table->boolean('is_kepala_keluarga')->default(false);
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->unique('jamaah_id');
            $table->unique(['keluarga_id', 'jamaah_id']);
            $table->index(['keluarga_id', 'is_kepala_keluarga']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jamaah_keluarga');
        Schema::dropIfExists('keluarga');
    }
};
