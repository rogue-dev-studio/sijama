<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:36:26
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:36:26
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class KonfigSystemK extends Model
{
    protected $table = 'konfigsystem_k';

    protected $primaryKey = 'konfigsystem_id';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $hidden = [
        'smtp_password',
        'fonnte_token',
        'telegram_bot_token',
        'n8n_api_key',
    ];

    protected $fillable = [
        'additional_data',
        'created_date',
        'created_by',
        'modified_count',
        'last_modified_date',
        'last_modified_by',
        'is_active',
        'is_deleted',
        'deleted_date',
        'deleted_by',
        'mail_protocol',
        'smtp_hostname',
        'mail_parameter',
        'smtp_username',
        'smtp_password',
        'smtp_port',
        'smtp_timeout',
        'smtp_encryption',
        'mail_from_address',
        'mail_from_name',
        'mail_reply_to',
        'password_reset_email_enabled',
        'password_reset_phone_enabled',
        'sms_driver',
        'sms_country_code',
        'fonnte_token',
        'fonnte_endpoint',
        'telegram_enabled',
        'telegram_bot_token',
        'telegram_bot_username',
        'telegram_default_chat_id',
        'n8n_enabled',
        'n8n_base_url',
        'n8n_webhook_url',
        'n8n_api_key',
        'header',
        'footer',
        'website',
        'footer_link',
        'footer_detail',
        'footer_detail_link',
        'header_detail',
        'path_logoheader',
        'app_nama',
        'nama_instansi',
        'alamat',
        'telepon',
        'email_kontak',
        'timezone',
        'locale',
        'path_favicon',
        'path_logofooter',
        'path_background',
        'background_style',
        'background_repeat_size',
        'color_bg',
        'color_surface',
        'color_ink',
        'color_accent',
        'color_accent_soft',
        'color_muted',
        'color_border',
        'theme_color',
        'maintenance_mode',
        'maintenance_message',
        'path_maintenance_background',
        'maintenance_background_style',
        'maintenance_background_repeat_size',
    ];

    protected function casts(): array
    {
        return [
            'created_by' => 'integer',
            'modified_count' => 'integer',
            'last_modified_by' => 'integer',
            'deleted_by' => 'integer',
            'smtp_port' => 'integer',
            'smtp_timeout' => 'integer',
            'is_active' => 'boolean',
            'is_deleted' => 'boolean',
            'maintenance_mode' => 'boolean',
            'password_reset_email_enabled' => 'boolean',
            'password_reset_phone_enabled' => 'boolean',
            'telegram_enabled' => 'boolean',
            'n8n_enabled' => 'boolean',
            'created_date' => 'datetime',
            'last_modified_date' => 'datetime',
            'deleted_date' => 'datetime',
            'smtp_password' => 'encrypted',
            'fonnte_token' => 'encrypted',
            'telegram_bot_token' => 'encrypted',
            'n8n_api_key' => 'encrypted',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeNotDeleted(Builder $query): Builder
    {
        return $query->where('is_deleted', false);
    }
}
