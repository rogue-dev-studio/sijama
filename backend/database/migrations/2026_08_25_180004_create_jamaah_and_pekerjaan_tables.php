<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:59:30
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:59:30
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pekerjaan', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100);
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('jamaah', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelompok_id')->nullable()->constrained('kelompok')->restrictOnDelete();
            $table->foreignId('adm_desa_kelurahan_id')
                ->nullable()
                ->constrained('adm_desa_kelurahan')
                ->nullOnDelete();
            $table->string('nik')->nullable();
            $table->string('nama');
            $table->string('gender', 1);
            $table->date('tanggal_lahir')->nullable();
            $table->string('kategori_umur', 32)->nullable()->index();
            $table->string('pekerjaan', 100)->nullable();
            $table->foreignId('pekerjaan_id')->nullable()->constrained('pekerjaan')->nullOnDelete();
            $table->string('pendidikan', 50)->nullable();
            $table->string('status_pernikahan', 32)->nullable()->index();
            $table->text('alamat')->nullable();
            $table->string('rt')->nullable();
            $table->string('rw')->nullable();
            $table->string('kode_pos', 10)->nullable()->index();
            $table->string('no_hp');
            $table->string('email')->nullable();
            $table->string('status')->default('aktif')->index();
            $table->string('foto_path')->nullable();
            $table->jsonb('face_descriptor')->nullable();
            $table->timestamp('enrolled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('kelompok_id');
            $table->index('adm_desa_kelurahan_id');
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement(
                'CREATE UNIQUE INDEX jamaah_nik_active_unique ON jamaah (nik) WHERE deleted_at IS NULL AND nik IS NOT NULL'
            );
        } else {
            Schema::table('jamaah', function (Blueprint $table) {
                $table->unique('nik');
            });
        }

        Schema::create('jamaah_dapukan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jamaah_id')->constrained('jamaah')->cascadeOnDelete();
            $table->foreignId('dapukan_id')->constrained('dapukan')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['jamaah_id', 'dapukan_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('dapukan_id')->nullable()->after('password')->constrained('dapukan')->nullOnDelete();
            $table->foreignId('jamaah_id')->nullable()->after('dapukan_id')->constrained('jamaah')->nullOnDelete();
            $table->foreignId('pusat_id')->nullable()->after('jamaah_id')->constrained('pusat')->nullOnDelete();
            $table->foreignId('daerah_id')->nullable()->after('pusat_id')->constrained('daerah')->nullOnDelete();
            $table->foreignId('desa_id')->nullable()->after('daerah_id')->constrained('desa')->nullOnDelete();
            $table->foreignId('kelompok_id')->nullable()->after('desa_id')->constrained('kelompok')->nullOnDelete();
            $table->unique('jamaah_id');
            $table->index('dapukan_id');
            $table->index('pusat_id');
            $table->index('daerah_id');
            $table->index('desa_id');
            $table->index('kelompok_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('kelompok_id');
            $table->dropConstrainedForeignId('desa_id');
            $table->dropConstrainedForeignId('daerah_id');
            $table->dropConstrainedForeignId('pusat_id');
            $table->dropConstrainedForeignId('jamaah_id');
            $table->dropConstrainedForeignId('dapukan_id');
        });

        Schema::dropIfExists('jamaah_dapukan');

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS jamaah_nik_active_unique');
        }

        Schema::dropIfExists('jamaah');
        Schema::dropIfExists('pekerjaan');
    }
};
