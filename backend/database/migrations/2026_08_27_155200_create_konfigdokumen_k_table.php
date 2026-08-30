<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:52:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:20:00
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
            $table->unsignedInteger('lookup_id')->nullable();
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
            $table->string('path_logo_kiri', 500)->nullable();
            $table->string('path_logo_kanan', 500)->nullable();
            $table->string('layout_mode', 20)->default('kop_ganda');
            $table->json('header_style')->nullable();
            $table->string('paper_size', 20)->default('a4');
            $table->string('paper_orientation', 20)->default('portrait');
            $table->boolean('apply_pdf')->default(true);
            $table->boolean('apply_excel')->default(true);
            $table->boolean('apply_csv')->default(false);
            $table->boolean('show_print_date')->default(true);
            $table->string('print_date_label', 120)->nullable()->default('Dicetak');
            $table->boolean('show_print_row_count')->default(true);
            $table->boolean('show_generated_by')->default(true);
            $table->json('column_visibility')->nullable();
            $table->boolean('show_user_signature')->default(false);
            $table->boolean('show_user_name')->default(false);
            $table->boolean('show_user_phone')->default(false);
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE konfigdokumen_k RENAME CONSTRAINT konfigdokumen_k_pkey TO pk_konfigdokumen_k');
            DB::statement(
                "ALTER TABLE konfigdokumen_k ALTER COLUMN created_date SET DEFAULT (('now'::text)::date)"
            );
            DB::statement(
                'CREATE INDEX idx_konfigdokumen_k_active ON konfigdokumen_k (is_active, is_deleted)'
            );
            DB::statement(
                'CREATE UNIQUE INDEX uq_konfigdokumen_k_lookup_id ON konfigdokumen_k (lookup_id) WHERE lookup_id IS NOT NULL AND is_deleted = false'
            );
            DB::statement(
                'ALTER TABLE konfigdokumen_k
                 ADD CONSTRAINT fk_konfigdokumen_k_lookup
                 FOREIGN KEY (lookup_id) REFERENCES lookup_m (lookup_id)'
            );
        } else {
            Schema::table('konfigdokumen_k', function (Blueprint $table) {
                $table->index(['is_active', 'is_deleted'], 'idx_konfigdokumen_k_active');
                $table->unique('lookup_id', 'uq_konfigdokumen_k_lookup_id');
                $table->foreign('lookup_id', 'fk_konfigdokumen_k_lookup')
                    ->references('lookup_id')
                    ->on('lookup_m');
            });
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE konfigdokumen_k DROP CONSTRAINT IF EXISTS fk_konfigdokumen_k_lookup');
            DB::statement('DROP INDEX IF EXISTS uq_konfigdokumen_k_lookup_id');
            DB::statement('DROP INDEX IF EXISTS idx_konfigdokumen_k_active');
        } else {
            Schema::table('konfigdokumen_k', function (Blueprint $table) {
                $table->dropForeign('fk_konfigdokumen_k_lookup');
                $table->dropUnique('uq_konfigdokumen_k_lookup_id');
                $table->dropIndex('idx_konfigdokumen_k_active');
            });
        }

        Schema::dropIfExists('konfigdokumen_k');
    }
};
