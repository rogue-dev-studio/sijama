<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 12:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:05:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const ALLOWED = ['repeat', 'cover', 'contain', 'stretch'];

    public function up(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->string('background_style', 20)->default('cover')->after('path_background');
        });

        if (Schema::hasColumn('konfigsystem_k', 'background_pattern')) {
            DB::table('konfigsystem_k')->orderBy('konfigsystem_id')->chunkById(100, function ($rows): void {
                foreach ($rows as $row) {
                    $style = ($row->background_pattern ?? false) ? 'repeat' : 'cover';
                    DB::table('konfigsystem_k')
                        ->where('konfigsystem_id', $row->konfigsystem_id)
                        ->update(['background_style' => $style]);
                }
            }, 'konfigsystem_id');

            Schema::table('konfigsystem_k', function (Blueprint $table) {
                $table->dropColumn('background_pattern');
            });
        }
    }

    public function down(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->boolean('background_pattern')->default(false)->after('path_background');
        });

        DB::table('konfigsystem_k')->orderBy('konfigsystem_id')->chunkById(100, function ($rows): void {
            foreach ($rows as $row) {
                $pattern = ($row->background_style ?? 'cover') === 'repeat';
                DB::table('konfigsystem_k')
                    ->where('konfigsystem_id', $row->konfigsystem_id)
                    ->update(['background_pattern' => $pattern]);
            }
        }, 'konfigsystem_id');

        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->dropColumn('background_style');
        });
    }
};
