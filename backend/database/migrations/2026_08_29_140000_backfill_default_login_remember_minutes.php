<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 14:00:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereNull('login_remember_minutes')
            ->update(['login_remember_minutes' => 1440]);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('login_remember_minutes', 1440)
            ->update(['login_remember_minutes' => null]);
    }
};
