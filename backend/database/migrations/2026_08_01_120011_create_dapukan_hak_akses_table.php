<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }
};
