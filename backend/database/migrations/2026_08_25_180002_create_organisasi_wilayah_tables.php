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
        Schema::create('pusat', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('daerah', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pusat_id')->constrained('pusat')->restrictOnDelete();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('desa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daerah_id')->constrained('daerah')->restrictOnDelete();
            $table->foreignId('adm_desa_kelurahan_id')
                ->nullable()
                ->constrained('adm_desa_kelurahan')
                ->nullOnDelete();
            $table->string('kode');
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['daerah_id', 'kode']);
            $table->index('daerah_id');
        });

        Schema::create('kelompok', function (Blueprint $table) {
            $table->id();
            $table->foreignId('desa_id')->constrained('desa')->restrictOnDelete();
            $table->string('kode')->nullable();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('desa_id');
        });

        Schema::create('sub_kelompok', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelompok_id')->constrained('kelompok')->cascadeOnDelete();
            $table->string('kode')->nullable();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('kelompok_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sub_kelompok');
        Schema::dropIfExists('kelompok');
        Schema::dropIfExists('desa');
        Schema::dropIfExists('daerah');
        Schema::dropIfExists('pusat');
    }
};
