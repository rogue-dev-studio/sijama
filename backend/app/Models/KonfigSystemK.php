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
            'created_date' => 'datetime',
            'last_modified_date' => 'datetime',
            'deleted_date' => 'datetime',
            'smtp_password' => 'encrypted',
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
