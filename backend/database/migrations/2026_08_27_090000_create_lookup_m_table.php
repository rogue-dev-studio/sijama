<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 09:21:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 09:21:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lookup_m', function (Blueprint $table) {
            $table->increments('lookup_id');
            $table->string('lookup_type', 100);
            $table->string('lookup_name', 200)->nullable();
            $table->string('lookup_value', 200)->nullable();
            $table->integer('lookup_urutan')->nullable();
            $table->string('lookup_kode', 50)->nullable();
            $table->text('additional_data')->nullable();
            $table->timestamp('created_date', 6);
            $table->integer('created_by')->nullable();
            $table->integer('modified_count')->nullable();
            $table->timestamp('last_modified_date', 6)->nullable();
            $table->integer('last_modified_by')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamp('deleted_date', 6)->nullable();
            $table->integer('deleted_by')->nullable();
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE lookup_m RENAME CONSTRAINT lookup_m_pkey TO pk_lookup_m');
            DB::statement(
                "ALTER TABLE lookup_m ALTER COLUMN created_date SET DEFAULT (('now'::text)::date)"
            );
            DB::statement(
                'CREATE INDEX idx_lookup_type_text ON lookup_m USING btree ((lookup_type::text))'
            );
        } else {
            Schema::table('lookup_m', function (Blueprint $table) {
                $table->index('lookup_type', 'idx_lookup_type_text');
            });
        }

        if (Schema::hasTable('jamaah') && Schema::hasColumn('jamaah', 'pekerjaan_id')) {
            Schema::table('jamaah', function (Blueprint $table) {
                $table->foreign('pekerjaan_id')
                    ->references('lookup_id')
                    ->on('lookup_m')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('jamaah') && Schema::hasColumn('jamaah', 'pekerjaan_id')) {
            Schema::table('jamaah', function (Blueprint $table) {
                $table->dropForeign(['pekerjaan_id']);
            });
        }

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS idx_lookup_type_text');
        } else {
            Schema::table('lookup_m', function (Blueprint $table) {
                $table->dropIndex('idx_lookup_type_text');
            });
        }

        Schema::dropIfExists('lookup_m');
    }
};
