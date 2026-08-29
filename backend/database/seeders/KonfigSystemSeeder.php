<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:56:22
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
 */

namespace Database\Seeders;

use App\Models\KonfigSystemK;
use App\Support\SystemKonfig;
use Illuminate\Database\Seeder;

class KonfigSystemSeeder extends Seeder
{
    public function run(): void
    {
        $existing = KonfigSystemK::query()->notDeleted()->orderBy('konfigsystem_id')->get();
        $primary = $existing->first();

        foreach ($existing->skip(1) as $extra) {
            $extra->update([
                'is_deleted' => true,
                'is_active' => false,
                'deleted_date' => now(),
            ]);
        }

        $payload = [
            'app_nama' => config('app.name', 'SIJAMA'),
            'nama_instansi' => 'Sistem Informasi Jamaah',
            'alamat' => null,
            'telepon' => null,
            'email_kontak' => 'admin@sijama.local',
            'timezone' => config('app.timezone', 'Asia/Jakarta'),
            'locale' => config('app.locale', 'id'),
            'mail_protocol' => env('MAIL_MAILER', 'log') === 'log' ? 'log' : 'smtp',
            'smtp_hostname' => env('MAIL_HOST', '127.0.0.1'),
            'mail_parameter' => null,
            'smtp_username' => env('MAIL_USERNAME'),
            'smtp_port' => (int) env('MAIL_PORT', 587),
            'smtp_timeout' => 30,
            'smtp_encryption' => env('MAIL_ENCRYPTION', 'tls'),
            'mail_from_address' => env('MAIL_FROM_ADDRESS', 'hello@sijama.local'),
            'mail_from_name' => env('MAIL_FROM_NAME', config('app.name', 'SIJAMA')),
            'mail_reply_to' => env('MAIL_FROM_ADDRESS', 'hello@sijama.local'),
            'password_reset_email_enabled' => filter_var(
                env('PASSWORD_RESET_EMAIL_ENABLED', true),
                FILTER_VALIDATE_BOOLEAN,
            ),
            'password_reset_phone_enabled' => filter_var(
                env('PASSWORD_RESET_PHONE_ENABLED', false),
                FILTER_VALIDATE_BOOLEAN,
            ),
            'sms_driver' => env('SMS_DRIVER', 'log'),
            'sms_country_code' => env('SMS_COUNTRY_CODE', '62'),
            'fonnte_endpoint' => env('FONNTE_ENDPOINT', 'https://api.fonnte.com/send'),
            'telegram_enabled' => filter_var(env('TELEGRAM_BOT_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
            'telegram_bot_username' => env('TELEGRAM_BOT_USERNAME'),
            'telegram_default_chat_id' => env('TELEGRAM_DEFAULT_CHAT_ID'),
            'n8n_enabled' => filter_var(env('N8N_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
            'n8n_base_url' => env('N8N_BASE_URL'),
            'n8n_webhook_url' => env('N8N_WEBHOOK_URL'),
            'header' => config('app.name', 'SIJAMA'),
            'footer' => 'Rogue Development',
            'website' => 'https://github.com/rogue-dev-studio',
            'footer_link' => 'https://github.com/rogue-dev-studio',
            'footer_detail' => 'Rogue Dev Studio · @rogue-dev-studio',
            'footer_detail_link' => 'https://github.com/rogue-dev-studio',
            'header_detail' => 'Sistem Informasi Jamaah',
            'path_logoheader' => null,
            'path_favicon' => null,
            'path_logofooter' => null,
            'path_background' => null,
            'background_style' => 'cover',
            'background_repeat_size' => '28px',
            'color_bg' => null,
            'color_surface' => null,
            'color_ink' => null,
            'color_accent' => null,
            'color_accent_soft' => null,
            'color_muted' => null,
            'color_border' => null,
            'theme_color' => null,
            'maintenance_mode' => false,
            'maintenance_message' => 'Aplikasi sedang dalam perawatan. Silakan coba lagi nanti.',
            'path_maintenance_background' => null,
            'maintenance_background_style' => 'cover',
            'maintenance_background_repeat_size' => '28px',
            'additional_data' => null,
            'is_active' => true,
            'is_deleted' => false,
        ];

        if ($mailPassword = env('MAIL_PASSWORD')) {
            $payload['smtp_password'] = $mailPassword;
        }

        if ($fonnteToken = env('FONNTE_TOKEN')) {
            $payload['fonnte_token'] = $fonnteToken;
        }

        if ($telegramToken = env('TELEGRAM_BOT_TOKEN')) {
            $payload['telegram_bot_token'] = $telegramToken;
        }

        if ($n8nKey = env('N8N_API_KEY')) {
            $payload['n8n_api_key'] = $n8nKey;
        }

        if ($primary) {
            $primary->fill($payload);
            $primary->last_modified_date = now();
            $primary->modified_count = ((int) $primary->modified_count) + 1;
            $primary->save();
        } else {
            $payload['created_date'] = now();
            $payload['created_by'] = null;
            $payload['modified_count'] = 0;
            KonfigSystemK::query()->create($payload);
        }

        SystemKonfig::forgetCache();
    }
}
