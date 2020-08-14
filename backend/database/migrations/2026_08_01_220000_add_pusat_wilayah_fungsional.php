<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:44:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:44:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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

        $now = now();
        $pusatId = DB::table('pusat')->insertGetId([
            'kode' => 'pusat-default',
            'nama' => 'Pusat',
            'deskripsi' => 'Pusat organisasi default',
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        Schema::table('daerah', function (Blueprint $table) {
            $table->foreignId('pusat_id')->nullable()->after('id')->constrained('pusat')->restrictOnDelete();
        });

        DB::table('daerah')->whereNull('pusat_id')->update(['pusat_id' => $pusatId]);

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE daerah ALTER COLUMN pusat_id SET NOT NULL');
        }

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('pusat_id')->nullable()->after('dapukan_id')->constrained('pusat')->nullOnDelete();
            $table->index('pusat_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pusat_id');
        });

        Schema::table('daerah', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pusat_id');
        });

        Schema::dropIfExists('pusat');
    }
};
