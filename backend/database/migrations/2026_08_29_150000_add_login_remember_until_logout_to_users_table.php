<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 15:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:00:00
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
            $table->boolean('login_remember_until_logout')->default(false)->after('login_remember_minutes');
        });

        DB::table('users')->update([
            'login_remember_minutes' => null,
            'login_remember_until_logout' => false,
        ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('login_remember_until_logout');
        });
    }
};
