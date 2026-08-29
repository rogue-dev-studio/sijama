<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:06:27
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:06:27
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->boolean('password_reset_phone_enabled')->default(false)->after('mail_reply_to');
            $table->string('sms_driver', 30)->nullable()->after('password_reset_phone_enabled');
            $table->string('sms_country_code', 8)->nullable()->after('sms_driver');
            $table->text('fonnte_token')->nullable()->after('sms_country_code');
            $table->string('fonnte_endpoint', 500)->nullable()->after('fonnte_token');
        });
    }

    public function down(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->dropColumn([
                'password_reset_phone_enabled',
                'sms_driver',
                'sms_country_code',
                'fonnte_token',
                'fonnte_endpoint',
            ]);
        });
    }
};
