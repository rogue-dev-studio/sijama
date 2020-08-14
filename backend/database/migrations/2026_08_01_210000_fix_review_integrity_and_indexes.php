<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:43:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:43:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropUnique(['nik']);
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('CREATE UNIQUE INDEX jamaah_nik_active_unique ON jamaah (nik) WHERE deleted_at IS NULL AND nik IS NOT NULL');
        } else {
            Schema::table('jamaah', function (Blueprint $table) {
                $table->unique('nik');
            });
        }

        Schema::table('desa', function (Blueprint $table) {
            $table->dropForeign(['daerah_id']);
        });
        Schema::table('desa', function (Blueprint $table) {
            $table->foreign('daerah_id')->references('id')->on('daerah')->restrictOnDelete();
        });

        Schema::table('kelompok', function (Blueprint $table) {
            $table->dropForeign(['desa_id']);
        });
        Schema::table('kelompok', function (Blueprint $table) {
            $table->foreign('desa_id')->references('id')->on('desa')->restrictOnDelete();
        });

        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropForeign(['kelompok_id']);
        });
        Schema::table('jamaah', function (Blueprint $table) {
            $table->foreign('kelompok_id')->references('id')->on('kelompok')->restrictOnDelete();
        });

        Schema::table('jamaah', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('pengajian', function (Blueprint $table) {
            $table->index(['status', 'starts_at']);
        });

        Schema::table('kegiatan', function (Blueprint $table) {
            $table->index(['status', 'tanggal']);
        });

        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->index('jamaah_id');
            $table->index('recorded_at');
            $table->index('recorded_by');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('dapukan_id');
            $table->index('daerah_id');
            $table->index('desa_id');
            $table->index('kelompok_id');
        });

        Schema::table('menus', function (Blueprint $table) {
            $table->index('parent_id');
        });

        Schema::table('fiturs', function (Blueprint $table) {
            $table->index('menu_id');
        });

        Schema::table('hak_akses', function (Blueprint $table) {
            $table->index('fitur_id');
        });
    }

    public function down(): void
    {
        Schema::table('hak_akses', function (Blueprint $table) {
            $table->dropIndex(['fitur_id']);
        });
        Schema::table('fiturs', function (Blueprint $table) {
            $table->dropIndex(['menu_id']);
        });
        Schema::table('menus', function (Blueprint $table) {
            $table->dropIndex(['parent_id']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['dapukan_id']);
            $table->dropIndex(['daerah_id']);
            $table->dropIndex(['desa_id']);
            $table->dropIndex(['kelompok_id']);
        });
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['jamaah_id']);
            $table->dropIndex(['recorded_at']);
            $table->dropIndex(['recorded_by']);
        });
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });
        Schema::table('kegiatan', function (Blueprint $table) {
            $table->dropIndex(['status', 'tanggal']);
        });
        Schema::table('pengajian', function (Blueprint $table) {
            $table->dropIndex(['status', 'starts_at']);
        });
        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropForeign(['kelompok_id']);
        });
        Schema::table('jamaah', function (Blueprint $table) {
            $table->foreign('kelompok_id')->references('id')->on('kelompok')->nullOnDelete();
        });

        Schema::table('kelompok', function (Blueprint $table) {
            $table->dropForeign(['desa_id']);
        });
        Schema::table('kelompok', function (Blueprint $table) {
            $table->foreign('desa_id')->references('id')->on('desa')->cascadeOnDelete();
        });

        Schema::table('desa', function (Blueprint $table) {
            $table->dropForeign(['daerah_id']);
        });
        Schema::table('desa', function (Blueprint $table) {
            $table->foreign('daerah_id')->references('id')->on('daerah')->cascadeOnDelete();
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS jamaah_nik_active_unique');
        } else {
            Schema::table('jamaah', function (Blueprint $table) {
                $table->dropUnique(['nik']);
            });
        }

        Schema::table('jamaah', function (Blueprint $table) {
            $table->unique('nik');
        });
    }
};
