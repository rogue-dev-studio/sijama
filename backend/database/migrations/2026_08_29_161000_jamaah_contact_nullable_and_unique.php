<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:10:00
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
            $table->string('no_hp')->nullable()->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement(
                'CREATE UNIQUE INDEX jamaah_no_hp_active_unique ON jamaah (no_hp) '
                ."WHERE deleted_at IS NULL AND no_hp IS NOT NULL AND no_hp <> ''"
            );
            DB::statement(
                'CREATE UNIQUE INDEX jamaah_email_active_unique ON jamaah (email) '
                ."WHERE deleted_at IS NULL AND email IS NOT NULL AND email <> ''"
            );
        } else {
            Schema::table('jamaah', function (Blueprint $table) {
                $table->unique('no_hp');
                $table->unique('email');
            });
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS jamaah_no_hp_active_unique');
            DB::statement('DROP INDEX IF EXISTS jamaah_email_active_unique');
        } else {
            Schema::table('jamaah', function (Blueprint $table) {
                $table->dropUnique(['no_hp']);
                $table->dropUnique(['email']);
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
        });

        Schema::table('jamaah', function (Blueprint $table) {
            $table->string('no_hp')->nullable(false)->change();
        });
    }
};
