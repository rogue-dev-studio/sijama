<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:52:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 15:52:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('konfigdokumen_k', function (Blueprint $table) {
            $table->increments('konfigdokumen_id');
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
            $table->text('header')->nullable();
            $table->text('header_detail')->nullable();
            $table->text('footer')->nullable();
            $table->text('footer_detail')->nullable();
            $table->boolean('apply_pdf')->default(true);
            $table->boolean('apply_excel')->default(true);
            $table->boolean('apply_csv')->default(false);
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE konfigdokumen_k RENAME CONSTRAINT konfigdokumen_k_pkey TO pk_konfigdokumen_k');
            DB::statement(
                "ALTER TABLE konfigdokumen_k ALTER COLUMN created_date SET DEFAULT (('now'::text)::date)"
            );
            DB::statement(
                'CREATE INDEX idx_konfigdokumen_k_active ON konfigdokumen_k (is_active, is_deleted)'
            );
        } else {
            Schema::table('konfigdokumen_k', function (Blueprint $table) {
                $table->index(['is_active', 'is_deleted'], 'idx_konfigdokumen_k_active');
            });
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS idx_konfigdokumen_k_active');
        } else {
            Schema::table('konfigdokumen_k', function (Blueprint $table) {
                $table->dropIndex('idx_konfigdokumen_k_active');
            });
        }

        Schema::dropIfExists('konfigdokumen_k');
    }
};
