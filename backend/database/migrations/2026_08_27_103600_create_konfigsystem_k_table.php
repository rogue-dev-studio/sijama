<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:36:26
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:40:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('konfigsystem_k', function (Blueprint $table) {
            $table->increments('konfigsystem_id');
            $table->text('additional_data')->nullable();
            $table->timestamp('created_date', 6);
            $table->integer('created_by')->nullable();
            $table->integer('modified_count')->nullable();
            $table->timestamp('last_modified_date', 6)->nullable();
            $table->integer('last_modified_by')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('deleted_date', 6)->nullable();
            $table->integer('deleted_by')->nullable();
            $table->string('mail_protocol', 50)->nullable();
            $table->string('smtp_hostname', 200)->nullable();
            $table->string('mail_parameter', 255)->nullable();
            $table->string('smtp_username', 200)->nullable();
            $table->string('smtp_password', 255)->nullable();
            $table->integer('smtp_port')->nullable();
            $table->integer('smtp_timeout')->nullable();
            $table->string('smtp_encryption', 20)->nullable();
            $table->string('mail_from_address', 200)->nullable();
            $table->string('mail_from_name', 200)->nullable();
            $table->string('mail_reply_to', 200)->nullable();
            $table->boolean('password_reset_email_enabled')->default(true);
            $table->boolean('password_reset_phone_enabled')->default(false);
            $table->string('sms_driver', 30)->nullable();
            $table->string('sms_country_code', 8)->nullable();
            $table->text('fonnte_token')->nullable();
            $table->string('fonnte_endpoint', 500)->nullable();
            $table->boolean('telegram_enabled')->default(false);
            $table->text('telegram_bot_token')->nullable();
            $table->string('telegram_bot_username', 100)->nullable();
            $table->string('telegram_default_chat_id', 64)->nullable();
            $table->boolean('n8n_enabled')->default(false);
            $table->string('n8n_base_url', 500)->nullable();
            $table->string('n8n_webhook_url', 500)->nullable();
            $table->text('n8n_api_key')->nullable();
            $table->text('header')->nullable();
            $table->text('footer')->nullable();
            $table->string('website', 500)->nullable();
            $table->string('footer_link', 500)->nullable();
            $table->string('footer_detail', 500)->nullable();
            $table->string('footer_detail_link', 500)->nullable();
            $table->text('header_detail')->nullable();
            $table->string('path_logoheader', 500)->nullable();
            $table->string('app_nama', 200)->nullable();
            $table->string('nama_instansi', 200)->nullable();
            $table->text('alamat')->nullable();
            $table->string('telepon', 50)->nullable();
            $table->string('email_kontak', 200)->nullable();
            $table->string('timezone', 64)->nullable();
            $table->string('locale', 20)->nullable();
            $table->string('path_favicon', 500)->nullable();
            $table->string('path_logofooter', 500)->nullable();
            $table->string('path_background', 500)->nullable();
            $table->string('background_style', 20)->default('cover');
            $table->string('background_repeat_size', 20)->default('28px');
            $table->string('color_bg', 7)->nullable();
            $table->string('color_surface', 7)->nullable();
            $table->string('color_ink', 7)->nullable();
            $table->string('color_accent', 7)->nullable();
            $table->string('color_accent_soft', 7)->nullable();
            $table->string('color_muted', 7)->nullable();
            $table->string('color_border', 7)->nullable();
            $table->string('theme_color', 7)->nullable();
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_message')->nullable();
            $table->string('path_maintenance_background', 500)->nullable();
            $table->string('maintenance_background_style', 20)->default('cover');
            $table->string('maintenance_background_repeat_size', 20)->default('28px');
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE konfigsystem_k RENAME CONSTRAINT konfigsystem_k_pkey TO pk_konfigsystem_k');
            DB::statement(
                "ALTER TABLE konfigsystem_k ALTER COLUMN created_date SET DEFAULT (('now'::text)::date)"
            );
            DB::statement(
                'CREATE INDEX idx_konfigsystem_k_active ON konfigsystem_k (is_active, is_deleted)'
            );
        } else {
            Schema::table('konfigsystem_k', function (Blueprint $table) {
                $table->index(['is_active', 'is_deleted'], 'idx_konfigsystem_k_active');
            });
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS idx_konfigsystem_k_active');
        } else {
            Schema::table('konfigsystem_k', function (Blueprint $table) {
                $table->dropIndex('idx_konfigsystem_k_active');
            });
        }

        Schema::dropIfExists('konfigsystem_k');
    }
};
