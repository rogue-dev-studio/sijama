<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:40:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jamaah_dapukan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jamaah_id')->constrained('jamaah')->cascadeOnDelete();
            $table->foreignId('dapukan_id')->constrained('dapukan')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['jamaah_id', 'dapukan_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jamaah_dapukan');
    }
};
