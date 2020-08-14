<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:47:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:47:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 64)->nullable()->after('name');
        });

        $users = DB::table('users')->select('id', 'email', 'name')->orderBy('id')->get();
        $used = [];

        foreach ($users as $user) {
            $base = null;

            if (is_string($user->email) && str_contains($user->email, '@')) {
                $base = strtolower(explode('@', $user->email, 2)[0]);
            }

            if (! $base) {
                $base = 'user'.$user->id;
            }

            $base = preg_replace('/[^a-z0-9._-]/', '', $base) ?: 'user'.$user->id;
            $candidate = $base;
            $suffix = 1;

            while (isset($used[$candidate])) {
                $candidate = $base.$suffix;
                $suffix++;
            }

            $used[$candidate] = true;
            DB::table('users')->where('id', $user->id)->update(['username' => $candidate]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->unique('username');
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN username SET NOT NULL');
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn('username');
        });
    }
};
