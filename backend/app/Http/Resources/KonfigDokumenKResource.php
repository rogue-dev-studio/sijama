<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:52:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:06:32
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\DocumentHeaderStyle;

class KonfigDokumenKResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lookup = $this->relationLoaded('lookup') ? $this->lookup : $this->lookup()->first();

        return [
            'id' => $this->konfigdokumen_id,
            'konfigdokumen_id' => $this->konfigdokumen_id,
            'lookup_id' => $this->lookup_id,
            'lookup_name' => $lookup?->lookup_name,
            'lookup_value' => $lookup?->lookup_value,
            'nama' => $lookup?->lookup_name ?: 'Konfigurasi Dokumen',
            'header' => $this->header,
            'header_detail' => $this->header_detail,
            'footer' => $this->footer,
            'footer_detail' => $this->footer_detail,
            'path_logo_kiri' => $this->path_logo_kiri,
            'path_logo_kanan' => $this->path_logo_kanan,
            'layout_mode' => DocumentHeaderStyle::normalizeLayoutMode($this->layout_mode),
            'header_style' => DocumentHeaderStyle::normalize($this->header_style),
            'apply_pdf' => (bool) $this->apply_pdf,
            'apply_excel' => (bool) $this->apply_excel,
            'apply_csv' => (bool) $this->apply_csv,
            'additional_data' => $this->additional_data,
            'is_active' => $this->is_active,
            'is_deleted' => $this->is_deleted,
            'is_configured' => true,
            'created_date' => $this->created_date?->toIso8601String(),
            'last_modified_date' => $this->last_modified_date?->toIso8601String(),
        ];
    }
}
