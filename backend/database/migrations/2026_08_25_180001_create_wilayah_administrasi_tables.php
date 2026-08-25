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
        Schema::create('adm_negara', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 8)->unique();
            $table->string('nama');
            $table->string('iso3', 3)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('adm_provinsi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('negara_id')->constrained('adm_negara')->restrictOnDelete();
            $table->string('kode', 8)->unique();
            $table->string('nama');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('negara_id');
        });

        Schema::create('adm_kabupaten_kota', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provinsi_id')->constrained('adm_provinsi')->restrictOnDelete();
            $table->string('kode', 16)->unique();
            $table->string('nama');
            $table->string('jenis', 16);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('provinsi_id');
            $table->index('jenis');
        });

        Schema::create('adm_kecamatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kabupaten_kota_id')->constrained('adm_kabupaten_kota')->restrictOnDelete();
            $table->string('kode', 24)->unique();
            $table->string('nama');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('kabupaten_kota_id');
        });

        Schema::create('adm_desa_kelurahan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kecamatan_id')->constrained('adm_kecamatan')->restrictOnDelete();
            $table->string('kode', 32)->unique();
            $table->string('nama');
            $table->string('jenis', 16);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('kecamatan_id');
            $table->index('jenis');
        });

        Schema::create('adm_kode_pos', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 10);
            $table->foreignId('desa_kelurahan_id')->nullable()->constrained('adm_desa_kelurahan')->nullOnDelete();
            $table->foreignId('kecamatan_id')->nullable()->constrained('adm_kecamatan')->nullOnDelete();
            $table->string('nama_wilayah')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['kode', 'desa_kelurahan_id']);
            $table->index('kecamatan_id');
            $table->index('kode');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adm_kode_pos');
        Schema::dropIfExists('adm_desa_kelurahan');
        Schema::dropIfExists('adm_kecamatan');
        Schema::dropIfExists('adm_kabupaten_kota');
        Schema::dropIfExists('adm_provinsi');
        Schema::dropIfExists('adm_negara');
    }
};
