<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 16:06:32
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:06:32
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konfigdokumen_k', function (Blueprint $table) {
            $table->unsignedInteger('lookup_id')->nullable()->after('konfigdokumen_id');
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
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
                $table->unique('lookup_id', 'uq_konfigdokumen_k_lookup_id');
                $table->foreign('lookup_id', 'fk_konfigdokumen_k_lookup')
                    ->references('lookup_id')
                    ->on('lookup_m');
            });
        }

        // Singleton lama tanpa lookup diganti model per-lookup.
        DB::table('konfigdokumen_k')
            ->whereNull('lookup_id')
            ->where('is_deleted', false)
            ->update([
                'is_deleted' => true,
                'is_active' => false,
                'deleted_date' => now(),
            ]);
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE konfigdokumen_k DROP CONSTRAINT IF EXISTS fk_konfigdokumen_k_lookup');
            DB::statement('DROP INDEX IF EXISTS uq_konfigdokumen_k_lookup_id');
        } else {
            Schema::table('konfigdokumen_k', function (Blueprint $table) {
                $table->dropForeign('fk_konfigdokumen_k_lookup');
                $table->dropUnique('uq_konfigdokumen_k_lookup_id');
            });
        }

        Schema::table('konfigdokumen_k', function (Blueprint $table) {
            $table->dropColumn('lookup_id');
        });
    }
};
