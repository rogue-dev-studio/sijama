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
        Schema::create('dapukan', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->string('tingkat')->nullable();
            $table->integer('urutan')->default(0);
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('menus')->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('nama');
            $table->string('path')->nullable();
            $table->string('icon')->nullable();
            $table->integer('urutan')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('parent_id');
        });

        Schema::create('fiturs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('menus')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('menu_id');
        });

        Schema::create('hak_akses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fitur_id')->constrained('fiturs')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('nama');
            $table->string('aksi');
            $table->timestamps();
            $table->index('fitur_id');
        });

        Schema::create('dapukan_hak_akses', function (Blueprint $table) {
            $table->foreignId('dapukan_id')->constrained('dapukan')->cascadeOnDelete();
            $table->foreignId('hak_akses_id')->constrained('hak_akses')->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['dapukan_id', 'hak_akses_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dapukan_hak_akses');
        Schema::dropIfExists('hak_akses');
        Schema::dropIfExists('fiturs');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('dapukan');
    }
};
