<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:42:08
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:42:08
 */

namespace App\Http\Requests;

use App\Support\AppFontPresets;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKonfigSystemKRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'app_nama' => ['nullable', 'string', 'max:200'],
            'nama_instansi' => ['nullable', 'string', 'max:200'],
            'alamat' => ['nullable', 'string'],
            'telepon' => ['nullable', 'string', 'max:50'],
            'email_kontak' => ['nullable', 'email', 'max:200'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'locale' => ['nullable', 'string', 'max:20'],
            'mail_protocol' => ['nullable', 'string', 'in:smtp,log,sendmail,array'],
            'smtp_hostname' => ['nullable', 'string', 'max:200'],
            'mail_parameter' => ['nullable', 'string', 'max:255'],
            'smtp_username' => ['nullable', 'string', 'max:200'],
            'smtp_password' => ['nullable', 'string', 'max:255'],
            'smtp_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'smtp_timeout' => ['nullable', 'integer', 'min:1'],
            'smtp_encryption' => ['nullable', 'string', 'max:20'],
            'mail_from_address' => ['nullable', 'email', 'max:200'],
            'mail_from_name' => ['nullable', 'string', 'max:200'],
            'mail_reply_to' => ['nullable', 'email', 'max:200'],
            'password_reset_email_enabled' => ['nullable', 'boolean'],
            'password_reset_phone_enabled' => ['nullable', 'boolean'],
            'sms_driver' => ['nullable', 'string', 'in:log,fonnte'],
            'sms_country_code' => ['nullable', 'string', 'max:8'],
            'fonnte_token' => ['nullable', 'string', 'max:500'],
            'fonnte_endpoint' => ['nullable', 'string', 'max:500'],
            'telegram_enabled' => ['nullable', 'boolean'],
            'telegram_bot_token' => ['nullable', 'string', 'max:500'],
            'telegram_bot_username' => ['nullable', 'string', 'max:100'],
            'telegram_default_chat_id' => ['nullable', 'string', 'max:64'],
            'n8n_enabled' => ['nullable', 'boolean'],
            'n8n_base_url' => ['nullable', 'string', 'max:500'],
            'n8n_webhook_url' => ['nullable', 'string', 'max:500'],
            'n8n_api_key' => ['nullable', 'string', 'max:500'],
            'api_co_id_holiday_enabled' => ['nullable', 'boolean'],
            'api_co_id_api_key' => ['nullable', 'string', 'max:500'],
            'api_co_id_holiday_base_url' => ['nullable', 'string', 'max:500'],
            'db_enabled' => ['nullable', 'boolean'],
            'db_driver' => ['nullable', 'string', 'max:32', 'in:pgsql,mysql,mariadb,sqlsrv,sqlite,other'],
            'db_project' => ['nullable', 'string', 'max:120'],
            'db_service_name' => ['nullable', 'string', 'max:120'],
            'db_plan' => ['nullable', 'string', 'max:64'],
            'db_region' => ['nullable', 'string', 'max:120'],
            'db_host' => ['nullable', 'string', 'max:255'],
            'db_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'db_database' => ['nullable', 'string', 'max:120'],
            'db_valid_until' => ['nullable', 'date'],
            'db_notes' => ['nullable', 'string', 'max:5000'],
            'smtp_valid_until' => ['nullable', 'date'],
            'fonnte_valid_until' => ['nullable', 'date'],
            'telegram_valid_until' => ['nullable', 'date'],
            'n8n_valid_until' => ['nullable', 'date'],
            'api_co_id_valid_until' => ['nullable', 'date'],
            'header' => ['nullable', 'string'],
            'footer' => ['nullable', 'string', 'max:200'],
            'website' => ['nullable', 'string', 'max:500'],
            'footer_link' => ['nullable', 'string', 'max:500'],
            'footer_detail' => ['nullable', 'string', 'max:500'],
            'footer_detail_link' => ['nullable', 'string', 'max:500'],
            'header_detail' => ['nullable', 'string'],
            'path_logoheader' => ['nullable', 'string', 'max:500'],
            'path_favicon' => ['nullable', 'string', 'max:500'],
            'path_logofooter' => ['nullable', 'string', 'max:500'],
            'path_background' => ['nullable', 'string', 'max:500'],
            'background_style' => ['nullable', 'string', 'in:repeat,cover,contain,stretch'],
            'background_repeat_size' => [
                'nullable',
                'string',
                'in:auto,16px,24px,28px,32px,40px,48px,64px,80px,96px,128px,160px,200px,256px',
            ],
            'color_bg' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_surface' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_ink' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_accent' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_accent_soft' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_muted' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_border' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'theme_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'font_family_display' => ['nullable', 'string', 'max:64', Rule::in(AppFontPresets::ids())],
            'font_family_body' => ['nullable', 'string', 'max:64', Rule::in(AppFontPresets::ids())],
            'maintenance_mode' => ['nullable', 'boolean'],
            'maintenance_message' => ['nullable', 'string'],
            'path_maintenance_background' => ['nullable', 'string', 'max:500'],
            'maintenance_background_style' => ['nullable', 'string', 'in:repeat,cover,contain,stretch'],
            'maintenance_background_repeat_size' => [
                'nullable',
                'string',
                'in:auto,16px,24px,28px,32px,40px,48px,64px,80px,96px,128px,160px,200px,256px',
            ],
            'additional_data' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
