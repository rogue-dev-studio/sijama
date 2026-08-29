<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:22:19
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:22:19
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->boolean('telegram_enabled')->default(false)->after('fonnte_endpoint');
            $table->text('telegram_bot_token')->nullable()->after('telegram_enabled');
            $table->string('telegram_bot_username', 100)->nullable()->after('telegram_bot_token');
            $table->string('telegram_default_chat_id', 64)->nullable()->after('telegram_bot_username');
            $table->boolean('n8n_enabled')->default(false)->after('telegram_default_chat_id');
            $table->string('n8n_base_url', 500)->nullable()->after('n8n_enabled');
            $table->string('n8n_webhook_url', 500)->nullable()->after('n8n_base_url');
            $table->text('n8n_api_key')->nullable()->after('n8n_webhook_url');
        });
    }

    public function down(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->dropColumn([
                'telegram_enabled',
                'telegram_bot_token',
                'telegram_bot_username',
                'telegram_default_chat_id',
                'n8n_enabled',
                'n8n_base_url',
                'n8n_webhook_url',
                'n8n_api_key',
            ]);
        });
    }
};
