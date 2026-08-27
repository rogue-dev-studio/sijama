<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:36:26
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:36:26
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('konfigsystem_k', function (Blueprint $table) {
            $table->increments('konfigsystem_id');
            $table->text('additional_data')->nullable();
            $table->timestamp('created_date', 6);
            $table->integer('created_by')->nullable();
            $table->integer('modified_count')->nullable();
            $table->timestamp('last_modified_date', 6)->nullable();
            $table->integer('last_modified_by')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('deleted_date', 6)->nullable();
            $table->integer('deleted_by')->nullable();
            $table->string('mail_protocol', 50)->nullable();
            $table->string('smtp_hostname', 200)->nullable();
            $table->string('mail_parameter', 255)->nullable();
            $table->string('smtp_username', 200)->nullable();
            $table->string('smtp_password', 255)->nullable();
            $table->integer('smtp_port')->nullable();
            $table->integer('smtp_timeout')->nullable();
            $table->string('smtp_encryption', 20)->nullable();
            $table->string('mail_from_address', 200)->nullable();
            $table->string('mail_from_name', 200)->nullable();
            $table->text('header')->nullable();
            $table->text('footer')->nullable();
            $table->text('header_detail')->nullable();
            $table->string('path_logoheader', 500)->nullable();
            $table->string('dash_logo', 500)->nullable();
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE konfigsystem_k RENAME CONSTRAINT konfigsystem_k_pkey TO pk_konfigsystem_k');
            DB::statement(
                "ALTER TABLE konfigsystem_k ALTER COLUMN created_date SET DEFAULT (('now'::text)::date)"
            );
            DB::statement(
                'CREATE INDEX idx_konfigsystem_k_active ON konfigsystem_k (is_active, is_deleted)'
            );
        } else {
            Schema::table('konfigsystem_k', function (Blueprint $table) {
                $table->index(['is_active', 'is_deleted'], 'idx_konfigsystem_k_active');
            });
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS idx_konfigsystem_k_active');
        } else {
            Schema::table('konfigsystem_k', function (Blueprint $table) {
                $table->dropIndex('idx_konfigsystem_k_active');
            });
        }

        Schema::dropIfExists('konfigsystem_k');
    }
};
