<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->foreignId('kelompok_id')
                ->nullable()
                ->after('id')
                ->constrained('kelompok')
                ->nullOnDelete();

            $table->index('kelompok_id');
        });
    }

    public function down(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropConstrainedForeignId('kelompok_id');
        });
    }
};
