<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:05:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->string('kategori_umur', 32)->nullable()->after('tanggal_lahir');
            $table->string('pekerjaan', 100)->nullable()->after('kategori_umur');
            $table->string('pendidikan', 50)->nullable()->after('pekerjaan');
            $table->index('kategori_umur');
        });
    }

    public function down(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropIndex(['kategori_umur']);
            $table->dropColumn(['kategori_umur', 'pekerjaan', 'pendidikan']);
        });
    }
};
