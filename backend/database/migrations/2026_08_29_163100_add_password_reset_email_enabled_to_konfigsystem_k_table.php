<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:30:11
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:30:11
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->boolean('password_reset_email_enabled')->default(true)->after('mail_reply_to');
        });
    }

    public function down(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->dropColumn('password_reset_email_enabled');
        });
    }
};
