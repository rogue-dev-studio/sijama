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
use App\Support\DocumentKonfig;
use App\Support\LookupKonfigDokumenMeta;

class KonfigDokumenKResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lookup = $this->relationLoaded('lookup') ? $this->lookup : $this->lookup()->first();
        $lookupPaper = LookupKonfigDokumenMeta::parse($lookup?->additional_data);

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
            'paper_size' => LookupKonfigDokumenMeta::normalizePaperSize(
                $this->paper_size ?? $lookupPaper['paper_size'],
            ),
            'paper_orientation' => LookupKonfigDokumenMeta::normalizePaperOrientation(
                $this->paper_orientation ?? $lookupPaper['paper_orientation'],
            ),
            'apply_pdf' => (bool) $this->apply_pdf,
            'apply_excel' => (bool) $this->apply_excel,
            'apply_csv' => (bool) $this->apply_csv,
            'show_print_date' => $this->show_print_date !== false,
            'print_date_label' => DocumentKonfig::resolvePrintDateLabel($this->print_date_label),
            'show_print_row_count' => $this->show_print_row_count !== false,
            'show_generated_by' => $this->show_generated_by !== false,
            'column_visibility' => is_array($this->column_visibility) ? $this->column_visibility : null,
            'show_user_signature' => (bool) $this->show_user_signature,
            'show_user_name' => (bool) $this->show_user_name,
            'show_user_phone' => (bool) $this->show_user_phone,
            'additional_data' => $this->additional_data,
            'is_active' => $this->is_active,
            'is_deleted' => $this->is_deleted,
            'is_configured' => true,
            'created_date' => $this->created_date?->toIso8601String(),
            'last_modified_date' => $this->last_modified_date?->toIso8601String(),
        ];
    }
}
