<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:42:08
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:42:08
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KonfigSystemKResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->konfigsystem_id,
            'konfigsystem_id' => $this->konfigsystem_id,
            'nama' => $this->app_nama ?: ($this->nama_instansi ?: 'Konfigurasi'),
            'app_nama' => $this->app_nama,
            'nama_instansi' => $this->nama_instansi,
            'alamat' => $this->alamat,
            'telepon' => $this->telepon,
            'email_kontak' => $this->email_kontak,
            'timezone' => $this->timezone,
            'locale' => $this->locale,
            'mail_protocol' => $this->mail_protocol,
            'smtp_hostname' => $this->smtp_hostname,
            'mail_parameter' => $this->mail_parameter,
            'smtp_username' => $this->smtp_username,
            'smtp_password_set' => filled($this->smtp_password),
            'smtp_port' => $this->smtp_port,
            'smtp_timeout' => $this->smtp_timeout,
            'smtp_encryption' => $this->smtp_encryption,
            'mail_from_address' => $this->mail_from_address,
            'mail_from_name' => $this->mail_from_name,
            'mail_reply_to' => $this->mail_reply_to,
            'header' => $this->header,
            'footer' => $this->footer,
            'website' => $this->website,
            'footer_link' => $this->footer_link,
            'footer_detail' => $this->footer_detail,
            'footer_detail_link' => $this->footer_detail_link,
            'header_detail' => $this->header_detail,
            'path_logoheader' => $this->path_logoheader,
            'path_favicon' => $this->path_favicon,
            'path_logofooter' => $this->path_logofooter,
            'path_background' => $this->path_background,
            'background_style' => in_array($this->background_style, ['repeat', 'cover', 'contain', 'stretch'], true)
                ? $this->background_style
                : 'cover',
            'background_repeat_size' => in_array(
                $this->background_repeat_size,
                ['auto', '16px', '24px', '28px', '32px', '40px', '48px', '64px', '80px', '96px', '128px', '160px', '200px', '256px'],
                true
            )
                ? $this->background_repeat_size
                : '28px',
            'color_bg' => $this->color_bg,
            'color_surface' => $this->color_surface,
            'color_ink' => $this->color_ink,
            'color_accent' => $this->color_accent,
            'color_accent_soft' => $this->color_accent_soft,
            'color_muted' => $this->color_muted,
            'color_border' => $this->color_border,
            'theme_color' => $this->theme_color,
            'maintenance_mode' => $this->maintenance_mode,
            'maintenance_message' => $this->maintenance_message,
            'additional_data' => $this->additional_data,
            'is_active' => $this->is_active,
            'is_deleted' => $this->is_deleted,
            'created_date' => $this->created_date?->toIso8601String(),
            'last_modified_date' => $this->last_modified_date?->toIso8601String(),
        ];
    }
}
