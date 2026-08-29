<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:42:08
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
 */

namespace App\Services;

use App\Http\Resources\KonfigSystemKResource;
use App\Models\KonfigSystemK;
use App\Support\SystemKonfig;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class KonfigSystemKService
{
    public function current(): JsonResource
    {
        return new KonfigSystemKResource($this->resolveSingleton());
    }

    /** @return array<string, mixed> */
    public function publicSettings(): array
    {
        return SystemKonfig::publicSettings();
    }

    public function resolveModel(): KonfigSystemK
    {
        return $this->resolveSingleton();
    }

    public function upsert(array $data): JsonResource
    {
        $model = $this->resolveSingleton();
        $payload = $this->prepare($data);
        $payload['last_modified_date'] = now();
        $payload['last_modified_by'] = Auth::id();
        $payload['modified_count'] = ((int) $model->modified_count) + 1;
        $model->update($payload);
        SystemKonfig::forgetCache();
        SystemKonfig::applyRuntimeConfig();

        return new KonfigSystemKResource($model->fresh());
    }

    private function resolveSingleton(): KonfigSystemK
    {
        $rows = KonfigSystemK::query()->notDeleted()->orderBy('konfigsystem_id')->get();
        $first = $rows->first();

        foreach ($rows->skip(1) as $extra) {
            $extra->update([
                'is_deleted' => true,
                'is_active' => false,
                'deleted_date' => now(),
                'deleted_by' => Auth::id(),
            ]);
        }

        if ($first) {
            return $this->hydrateMailSmsFromEnvIfEmpty($first);
        }

        $model = KonfigSystemK::query()->create([
            'created_date' => now(),
            'created_by' => Auth::id(),
            'modified_count' => 0,
            'is_deleted' => false,
            'is_active' => true,
            'maintenance_mode' => false,
            'app_nama' => config('app.name', 'SIJAMA'),
            'nama_instansi' => 'Sistem Informasi Jamaah',
            'header' => config('app.name', 'SIJAMA'),
            'header_detail' => 'Sistem Informasi Jamaah',
            'footer' => 'Rogue Development',
            'website' => 'https://github.com/rogue-dev-studio',
            'footer_link' => 'https://github.com/rogue-dev-studio',
            'footer_detail' => 'Rogue Dev Studio · @rogue-dev-studio',
            'footer_detail_link' => 'https://github.com/rogue-dev-studio',
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
            'timezone' => config('app.timezone', 'Asia/Jakarta'),
            'locale' => config('app.locale', 'id'),
            'mail_protocol' => env('MAIL_MAILER', 'smtp') === 'log' ? 'log' : 'smtp',
            'smtp_hostname' => env('MAIL_HOST'),
            'smtp_username' => env('MAIL_USERNAME'),
            'smtp_password' => env('MAIL_PASSWORD') ?: null,
            'smtp_port' => (int) env('MAIL_PORT', 587),
            'smtp_timeout' => 30,
            'smtp_encryption' => env('MAIL_ENCRYPTION', 'tls'),
            'mail_from_address' => env('MAIL_FROM_ADDRESS', config('mail.from.address')),
            'mail_from_name' => env('MAIL_FROM_NAME', config('mail.from.name', config('app.name', 'SIJAMA'))),
            'mail_reply_to' => env('MAIL_FROM_ADDRESS'),
            'password_reset_email_enabled' => filter_var(env('PASSWORD_RESET_EMAIL_ENABLED', true), FILTER_VALIDATE_BOOLEAN),
            'password_reset_phone_enabled' => filter_var(env('PASSWORD_RESET_PHONE_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
            'sms_driver' => env('SMS_DRIVER', config('sms.default', 'log')),
            'sms_country_code' => env('SMS_COUNTRY_CODE', config('sms.drivers.fonnte.country_code', '62')),
            'fonnte_token' => env('FONNTE_TOKEN') ?: null,
            'fonnte_endpoint' => env('FONNTE_ENDPOINT', config('sms.drivers.fonnte.endpoint')),
            'telegram_enabled' => filter_var(env('TELEGRAM_BOT_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
            'telegram_bot_token' => env('TELEGRAM_BOT_TOKEN') ?: null,
            'telegram_bot_username' => env('TELEGRAM_BOT_USERNAME'),
            'telegram_default_chat_id' => env('TELEGRAM_DEFAULT_CHAT_ID'),
            'n8n_enabled' => filter_var(env('N8N_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
            'n8n_base_url' => env('N8N_BASE_URL'),
            'n8n_webhook_url' => env('N8N_WEBHOOK_URL'),
            'n8n_api_key' => env('N8N_API_KEY') ?: null,
        ]);
        SystemKonfig::forgetCache();

        return $model;
    }

    private function hydrateMailSmsFromEnvIfEmpty(KonfigSystemK $model): KonfigSystemK
    {
        $updates = [];

        if (! filled($model->smtp_hostname) && filled(env('MAIL_HOST'))) {
            $updates['smtp_hostname'] = env('MAIL_HOST');
            $updates['mail_protocol'] = env('MAIL_MAILER', 'smtp') === 'log' ? 'log' : ($model->mail_protocol ?: 'smtp');
            $updates['smtp_port'] = $model->smtp_port ?: (int) env('MAIL_PORT', 587);
            $updates['smtp_timeout'] = $model->smtp_timeout ?: 30;
            $updates['smtp_encryption'] = $model->smtp_encryption ?: env('MAIL_ENCRYPTION', 'tls');
        }

        if (! filled($model->smtp_username) && filled(env('MAIL_USERNAME'))) {
            $updates['smtp_username'] = env('MAIL_USERNAME');
        }

        if (! filled($model->smtp_password) && filled(env('MAIL_PASSWORD'))) {
            $updates['smtp_password'] = env('MAIL_PASSWORD');
        }

        if (! filled($model->mail_from_address) && filled(env('MAIL_FROM_ADDRESS'))) {
            $updates['mail_from_address'] = env('MAIL_FROM_ADDRESS');
            $updates['mail_reply_to'] = $model->mail_reply_to ?: env('MAIL_FROM_ADDRESS');
        }

        if (! filled($model->mail_from_name) && filled(env('MAIL_FROM_NAME'))) {
            $updates['mail_from_name'] = env('MAIL_FROM_NAME') ?: config('app.name', 'SIJAMA');
        }

        if ($model->sms_driver === null && filled(env('SMS_DRIVER'))) {
            $updates['sms_driver'] = env('SMS_DRIVER', 'log');
        }

        if (! filled($model->sms_country_code) && filled(env('SMS_COUNTRY_CODE'))) {
            $updates['sms_country_code'] = env('SMS_COUNTRY_CODE', '62');
        }

        if (! filled($model->fonnte_endpoint) && filled(env('FONNTE_ENDPOINT'))) {
            $updates['fonnte_endpoint'] = env('FONNTE_ENDPOINT');
        }

        if (! filled($model->fonnte_token) && filled(env('FONNTE_TOKEN'))) {
            $updates['fonnte_token'] = env('FONNTE_TOKEN');
        }

        if (! Schema::hasColumn('konfigsystem_k', 'telegram_enabled')) {
            if ($updates === []) {
                return $model;
            }

            $updates['last_modified_date'] = now();
            $updates['modified_count'] = ((int) $model->modified_count) + 1;
            $model->fill($updates);
            $model->save();
            SystemKonfig::forgetCache();
            SystemKonfig::applyRuntimeConfig();

            return $model->fresh() ?? $model;
        }

        if (! filled($model->telegram_bot_token) && filled(env('TELEGRAM_BOT_TOKEN'))) {
            $updates['telegram_bot_token'] = env('TELEGRAM_BOT_TOKEN');
        }

        if (! filled($model->telegram_bot_username) && filled(env('TELEGRAM_BOT_USERNAME'))) {
            $updates['telegram_bot_username'] = env('TELEGRAM_BOT_USERNAME');
        }

        if (! filled($model->telegram_default_chat_id) && filled(env('TELEGRAM_DEFAULT_CHAT_ID'))) {
            $updates['telegram_default_chat_id'] = env('TELEGRAM_DEFAULT_CHAT_ID');
        }

        if (! filled($model->n8n_base_url) && filled(env('N8N_BASE_URL'))) {
            $updates['n8n_base_url'] = env('N8N_BASE_URL');
        }

        if (! filled($model->n8n_webhook_url) && filled(env('N8N_WEBHOOK_URL'))) {
            $updates['n8n_webhook_url'] = env('N8N_WEBHOOK_URL');
        }

        if (! filled($model->n8n_api_key) && filled(env('N8N_API_KEY'))) {
            $updates['n8n_api_key'] = env('N8N_API_KEY');
        }

        if ($updates === []) {
            return $model;
        }

        $updates['last_modified_date'] = now();
        $updates['modified_count'] = ((int) $model->modified_count) + 1;
        $model->fill($updates);
        $model->save();
        SystemKonfig::forgetCache();
        SystemKonfig::applyRuntimeConfig();

        return $model->fresh() ?? $model;
    }

    private function prepare(array $data): array
    {
        unset(
            $data['is_deleted'],
            $data['deleted_date'],
            $data['deleted_by'],
            $data['smtp_password_set'],
            $data['fonnte_token_set'],
            $data['telegram_bot_token_set'],
            $data['n8n_api_key_set'],
        );

        if (array_key_exists('smtp_password', $data) && ($data['smtp_password'] === null || $data['smtp_password'] === '')) {
            unset($data['smtp_password']);
        }

        if (array_key_exists('fonnte_token', $data) && ($data['fonnte_token'] === null || $data['fonnte_token'] === '')) {
            unset($data['fonnte_token']);
        }

        if (array_key_exists('telegram_bot_token', $data) && ($data['telegram_bot_token'] === null || $data['telegram_bot_token'] === '')) {
            unset($data['telegram_bot_token']);
        }

        if (array_key_exists('n8n_api_key', $data) && ($data['n8n_api_key'] === null || $data['n8n_api_key'] === '')) {
            unset($data['n8n_api_key']);
        }

        return $data;
    }
}
