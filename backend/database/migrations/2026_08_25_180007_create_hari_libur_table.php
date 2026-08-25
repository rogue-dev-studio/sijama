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
    }
};
