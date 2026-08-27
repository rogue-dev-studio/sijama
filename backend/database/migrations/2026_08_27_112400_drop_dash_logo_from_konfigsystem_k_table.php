<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:24:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:24:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('konfigsystem_k', 'dash_logo')) {
            return;
        }

        $rows = DB::table('konfigsystem_k')->whereNotNull('dash_logo')->get(['konfigsystem_id', 'path_logoheader', 'dash_logo']);

        foreach ($rows as $row) {
            if (filled($row->path_logoheader) || blank($row->dash_logo)) {
                continue;
            }

            DB::table('konfigsystem_k')
                ->where('konfigsystem_id', $row->konfigsystem_id)
                ->update(['path_logoheader' => $row->dash_logo]);
        }

        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->dropColumn('dash_logo');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('konfigsystem_k', 'dash_logo')) {
            return;
        }

        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->string('dash_logo', 500)->nullable()->after('path_logoheader');
        });

        DB::table('konfigsystem_k')
            ->whereNotNull('path_logoheader')
            ->update(['dash_logo' => DB::raw('path_logoheader')]);
    }
};
