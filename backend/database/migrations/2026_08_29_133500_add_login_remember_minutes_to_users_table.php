<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 13:35:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 13:35:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('login_remember_minutes')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('login_remember_minutes');
        });
    }
};
