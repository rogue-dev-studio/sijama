<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:52:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:06:32
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKonfigDokumenKRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lookup_id' => ['required', 'integer', 'min:1'],
            'header' => ['nullable', 'string'],
            'header_detail' => ['nullable', 'string'],
            'footer' => ['nullable', 'string'],
            'footer_detail' => ['nullable', 'string'],
            'layout_mode' => ['nullable', 'string', Rule::in(['biasa', 'sederhana', 'kop', 'kop_ganda', 'kop_kiri', 'kop_kanan', 'kop_atas'])],
            'header_style' => ['nullable', 'array'],
            'header_style.header_font_size' => ['nullable', 'integer', 'min:8', 'max:48'],
            'header_style.header_font_weight' => ['nullable', 'string', Rule::in(['400', '500', '600', '650', '700', '800'])],
            'header_style.header_align' => ['nullable', 'string', Rule::in(['left', 'center', 'right'])],
            'header_style.header_detail_font_size' => ['nullable', 'integer', 'min:8', 'max:36'],
            'header_style.header_detail_font_weight' => ['nullable', 'string', Rule::in(['400', '500', '600', '650', '700', '800'])],
            'header_style.header_detail_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'header_style.logo_max_height' => ['nullable', 'integer', 'min:24', 'max:160'],
            'header_style.footer_font_size' => ['nullable', 'integer', 'min:8', 'max:24'],
            'apply_pdf' => ['nullable', 'boolean'],
            'apply_excel' => ['nullable', 'boolean'],
            'apply_csv' => ['nullable', 'boolean'],
            'additional_data' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
