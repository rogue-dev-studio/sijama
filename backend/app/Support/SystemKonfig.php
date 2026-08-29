<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:56:22
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
 */

namespace App\Support;

use App\Models\KonfigSystemK;
use App\Support\DocumentKonfig;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class SystemKonfig
{
    public const CACHE_KEY = 'konfigsystem_k.active';

    public static function active(): ?KonfigSystemK
    {
        if (! Schema::hasTable('konfigsystem_k')) {
            return null;
        }

        try {
            return Cache::remember(self::CACHE_KEY, 60, fn () => self::queryActive());
        } catch (\Throwable) {
            return self::queryActive();
        }
    }

    public static function forgetCache(): void
    {
        try {
            Cache::forget(self::CACHE_KEY);
        } catch (\Throwable) {
            // ignore cache driver / permission failures
        }
    }

    private static function queryActive(): ?KonfigSystemK
    {
        return KonfigSystemK::query()
            ->notDeleted()
            ->where('is_active', true)
            ->orderBy('konfigsystem_id')
            ->first();
    }

    /** @return array<string, mixed> */
    public static function publicSettings(): array
    {
        $konfig = self::active();

        if (! $konfig) {
            return self::fallbackPublicSettings();
        }

        return [
            'app_nama' => $konfig->app_nama ?: config('app.name', 'SIJAMA'),
            'nama_instansi' => $konfig->nama_instansi,
            'alamat' => $konfig->alamat,
            'telepon' => $konfig->telepon,
            'email_kontak' => $konfig->email_kontak,
            'timezone' => $konfig->timezone ?: config('app.timezone', 'Asia/Jakarta'),
            'locale' => $konfig->locale ?: config('app.locale', 'id'),
            'header' => $konfig->header,
            'footer' => $konfig->footer,
            'website' => $konfig->website,
            'footer_link' => $konfig->footer_link,
            'footer_detail' => $konfig->footer_detail,
            'footer_detail_link' => $konfig->footer_detail_link,
            'header_detail' => $konfig->header_detail,
            'path_logoheader' => $konfig->path_logoheader,
            'path_favicon' => $konfig->path_favicon,
            'path_logofooter' => $konfig->path_logofooter,
            'path_background' => $konfig->path_background,
            'background_style' => self::normalizeBackgroundStyle($konfig->background_style),
            'background_repeat_size' => self::normalizeBackgroundRepeatSize($konfig->background_repeat_size),
            'color_bg' => $konfig->color_bg,
            'color_surface' => $konfig->color_surface,
            'color_ink' => $konfig->color_ink,
            'color_accent' => $konfig->color_accent,
            'color_accent_soft' => $konfig->color_accent_soft,
            'color_muted' => $konfig->color_muted,
            'color_border' => $konfig->color_border,
            'theme_color' => $konfig->theme_color,
            'maintenance_mode' => (bool) $konfig->maintenance_mode,
            'maintenance_message' => $konfig->maintenance_message
                ?: 'Aplikasi sedang dalam perawatan. Silakan coba lagi nanti.',
            'maintenance_login_allowed' => false,
            'path_maintenance_background' => Schema::hasColumn('konfigsystem_k', 'path_maintenance_background')
                ? $konfig->path_maintenance_background
                : null,
            'maintenance_background_style' => Schema::hasColumn('konfigsystem_k', 'maintenance_background_style')
                ? self::normalizeBackgroundStyle($konfig->maintenance_background_style)
                : 'cover',
            'maintenance_background_repeat_size' => Schema::hasColumn('konfigsystem_k', 'maintenance_background_repeat_size')
                ? self::normalizeBackgroundRepeatSize($konfig->maintenance_background_repeat_size)
                : '28px',
            'password_reset_phone_enabled' => Schema::hasColumn('konfigsystem_k', 'password_reset_phone_enabled')
                ? (bool) $konfig->password_reset_phone_enabled
                : (bool) config('sms.password_reset_enabled', false),
            'password_reset_email_enabled' => Schema::hasColumn('konfigsystem_k', 'password_reset_email_enabled')
                ? (bool) $konfig->password_reset_email_enabled
                : (bool) config('mail.password_reset_enabled', true),
            'telegram_enabled' => Schema::hasColumn('konfigsystem_k', 'telegram_enabled')
                ? (bool) $konfig->telegram_enabled
                : (bool) config('integrations.telegram.enabled', false),
            'n8n_enabled' => Schema::hasColumn('konfigsystem_k', 'n8n_enabled')
                ? (bool) $konfig->n8n_enabled
                : (bool) config('integrations.n8n.enabled', false),
            'dokumen' => DocumentKonfig::publicPayload(),
        ];
    }

    public static function applyRuntimeConfig(): void
    {
        $konfig = self::active();

        if (! $konfig) {
            return;
        }

        if (filled($konfig->app_nama)) {
            config(['app.name' => $konfig->app_nama]);
        }

        if (filled($konfig->timezone)) {
            config(['app.timezone' => $konfig->timezone]);
            date_default_timezone_set($konfig->timezone);
        }

        if (filled($konfig->locale)) {
            config(['app.locale' => $konfig->locale]);
            app()->setLocale($konfig->locale);
        }

        if (filled($konfig->smtp_hostname)) {
            $protocol = strtolower((string) ($konfig->mail_protocol ?: 'smtp'));
            if ($protocol === 'smtp') {
                config(['mail.default' => 'smtp']);
            } elseif (in_array($protocol, ['log', 'sendmail', 'array'], true)) {
                config(['mail.default' => $protocol]);
            }

            config([
                'mail.mailers.smtp.host' => $konfig->smtp_hostname,
                'mail.mailers.smtp.port' => $konfig->smtp_port ?: 587,
                'mail.mailers.smtp.encryption' => $konfig->smtp_encryption ?: null,
                'mail.mailers.smtp.username' => $konfig->smtp_username,
                'mail.mailers.smtp.password' => $konfig->smtp_password,
                'mail.mailers.smtp.timeout' => $konfig->smtp_timeout,
            ]);
        }

        if (filled($konfig->mail_from_address)) {
            config(['mail.from.address' => $konfig->mail_from_address]);
        }

        if (filled($konfig->mail_from_name)) {
            config(['mail.from.name' => $konfig->mail_from_name]);
        }

        if (! Schema::hasColumn('konfigsystem_k', 'password_reset_phone_enabled')) {
            return;
        }

        config([
            'sms.password_reset_enabled' => (bool) $konfig->password_reset_phone_enabled,
        ]);

        if (Schema::hasColumn('konfigsystem_k', 'password_reset_email_enabled')) {
            config([
                'mail.password_reset_enabled' => (bool) $konfig->password_reset_email_enabled,
            ]);
        }

        if (filled($konfig->sms_driver) && in_array($konfig->sms_driver, ['log', 'fonnte'], true)) {
            config(['sms.default' => $konfig->sms_driver]);
        }

        if (filled($konfig->sms_country_code)) {
            config(['sms.drivers.fonnte.country_code' => $konfig->sms_country_code]);
        }

        if (filled($konfig->fonnte_endpoint)) {
            config(['sms.drivers.fonnte.endpoint' => $konfig->fonnte_endpoint]);
        }

        if (filled($konfig->fonnte_token)) {
            config(['sms.drivers.fonnte.token' => $konfig->fonnte_token]);
        }

        if (! Schema::hasColumn('konfigsystem_k', 'telegram_enabled')) {
            return;
        }

        config([
            'integrations.telegram.enabled' => (bool) $konfig->telegram_enabled,
            'integrations.n8n.enabled' => (bool) $konfig->n8n_enabled,
        ]);

        if (filled($konfig->telegram_bot_token)) {
            config(['integrations.telegram.bot_token' => $konfig->telegram_bot_token]);
        }

        if (filled($konfig->telegram_bot_username)) {
            config(['integrations.telegram.bot_username' => $konfig->telegram_bot_username]);
        }

        if (filled($konfig->telegram_default_chat_id)) {
            config(['integrations.telegram.default_chat_id' => $konfig->telegram_default_chat_id]);
        }

        if (filled($konfig->n8n_base_url)) {
            config(['integrations.n8n.base_url' => $konfig->n8n_base_url]);
        }

        if (filled($konfig->n8n_webhook_url)) {
            config(['integrations.n8n.webhook_url' => $konfig->n8n_webhook_url]);
        }

        if (filled($konfig->n8n_api_key)) {
            config(['integrations.n8n.api_key' => $konfig->n8n_api_key]);
        }
    }

    /** @return array<string, mixed> */
    private static function fallbackPublicSettings(): array
    {
        return [
            'app_nama' => config('app.name', 'SIJAMA'),
            'nama_instansi' => 'Sistem Informasi Jamaah',
            'alamat' => null,
            'telepon' => null,
            'email_kontak' => null,
            'timezone' => config('app.timezone', 'Asia/Jakarta'),
            'locale' => config('app.locale', 'id'),
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
            'maintenance_login_allowed' => false,
            'path_maintenance_background' => null,
            'maintenance_background_style' => 'cover',
            'maintenance_background_repeat_size' => '28px',
            'password_reset_phone_enabled' => (bool) config('sms.password_reset_enabled', false),
            'password_reset_email_enabled' => (bool) config('mail.password_reset_enabled', true),
            'telegram_enabled' => (bool) config('integrations.telegram.enabled', false),
            'n8n_enabled' => (bool) config('integrations.n8n.enabled', false),
            'dokumen' => DocumentKonfig::publicPayload(),
        ];
    }

    private static function normalizeBackgroundStyle(?string $style): string
    {
        return in_array($style, ['repeat', 'cover', 'contain', 'stretch'], true) ? $style : 'cover';
    }

    private static function normalizeBackgroundRepeatSize(?string $size): string
    {
        $allowed = [
            'auto', '16px', '24px', '28px', '32px', '40px', '48px',
            '64px', '80px', '96px', '128px', '160px', '200px', '256px',
        ];

        return in_array($size, $allowed, true) ? $size : '28px';
    }
}
