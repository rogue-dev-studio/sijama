<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:00:00
 */

use App\Support\LoginRememberOptions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereNull('login_remember_minutes')
            ->where('login_remember_until_logout', false)
            ->update(['login_remember_minutes' => LoginRememberOptions::DEFAULT_MINUTES]);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('login_remember_minutes', LoginRememberOptions::DEFAULT_MINUTES)
            ->where('login_remember_until_logout', false)
            ->update(['login_remember_minutes' => null]);
    }
};
