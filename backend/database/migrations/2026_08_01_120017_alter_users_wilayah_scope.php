<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('daerah_id')->nullable()->after('dapukan_id')->constrained('daerah')->nullOnDelete();
            $table->foreignId('desa_id')->nullable()->after('daerah_id')->constrained('desa')->nullOnDelete();
            $table->foreignId('kelompok_id')->nullable()->after('desa_id')->constrained('kelompok')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('daerah_id');
            $table->dropConstrainedForeignId('desa_id');
            $table->dropConstrainedForeignId('kelompok_id');
        });
    }
};
