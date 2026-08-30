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
            'paper_size' => ['nullable', 'string', Rule::in(['a4', 'letter', 'legal', 'a5', 'folio'])],
            'paper_orientation' => ['nullable', 'string', Rule::in(['portrait', 'landscape'])],
            'header_style' => ['nullable', 'array'],
            'header_style.header_font_family' => ['nullable', 'string', Rule::in(['system-ui', 'arial', 'calibri', 'times-new-roman', 'georgia', 'courier-new', 'tahoma', 'verdana', 'segoe-ui'])],
            'header_style.header_font_size' => ['nullable', 'integer', 'min:8', 'max:48'],
            'header_style.header_font_weight' => ['nullable', 'string', Rule::in(['400', '500', '600', '650', '700', '800'])],
            'header_style.header_align' => ['nullable', 'string', Rule::in(['left', 'center', 'right', 'justify'])],
            'header_style.header_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'header_style.header_text_transform' => ['nullable', 'string', Rule::in(['none', 'uppercase', 'lowercase', 'capitalize'])],
            'header_style.header_letter_spacing' => ['nullable', 'integer', 'min:-2', 'max:12'],
            'header_style.header_font_style' => ['nullable', 'string', Rule::in(['normal', 'italic'])],
            'header_style.header_underline' => ['nullable', 'boolean'],
            'header_style.header_strikethrough' => ['nullable', 'boolean'],
            'header_style.header_line_height' => ['nullable', 'numeric', 'min:1', 'max:2.5'],
            'header_style.header_detail_font_family' => ['nullable', 'string', Rule::in(['system-ui', 'arial', 'calibri', 'times-new-roman', 'georgia', 'courier-new', 'tahoma', 'verdana', 'segoe-ui'])],
            'header_style.header_detail_font_size' => ['nullable', 'integer', 'min:8', 'max:36'],
            'header_style.header_detail_font_weight' => ['nullable', 'string', Rule::in(['400', '500', '600', '650', '700', '800'])],
            'header_style.header_detail_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'header_style.header_detail_align' => ['nullable', 'string', Rule::in(['left', 'center', 'right', 'justify'])],
            'header_style.header_detail_text_transform' => ['nullable', 'string', Rule::in(['none', 'uppercase', 'lowercase', 'capitalize'])],
            'header_style.header_detail_letter_spacing' => ['nullable', 'integer', 'min:-2', 'max:12'],
            'header_style.header_detail_font_style' => ['nullable', 'string', Rule::in(['normal', 'italic'])],
            'header_style.header_detail_underline' => ['nullable', 'boolean'],
            'header_style.header_detail_strikethrough' => ['nullable', 'boolean'],
            'header_style.header_detail_line_height' => ['nullable', 'numeric', 'min:1', 'max:2.5'],
            'header_style.logo_max_height' => ['nullable', 'integer', 'min:24', 'max:160'],
            'header_style.logo_max_width' => ['nullable', 'integer', 'min:40', 'max:240'],
            'header_style.brand_border_width' => ['nullable', 'integer', 'min:0', 'max:4'],
            'header_style.brand_border_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'header_style.footer_font_family' => ['nullable', 'string', Rule::in(['system-ui', 'arial', 'calibri', 'times-new-roman', 'georgia', 'courier-new', 'tahoma', 'verdana', 'segoe-ui'])],
            'header_style.footer_font_size' => ['nullable', 'integer', 'min:8', 'max:24'],
            'header_style.footer_font_weight' => ['nullable', 'string', Rule::in(['400', '500', '600', '650', '700', '800'])],
            'header_style.footer_text_transform' => ['nullable', 'string', Rule::in(['none', 'uppercase', 'lowercase', 'capitalize'])],
            'header_style.footer_letter_spacing' => ['nullable', 'integer', 'min:-2', 'max:12'],
            'header_style.footer_font_style' => ['nullable', 'string', Rule::in(['normal', 'italic'])],
            'header_style.footer_underline' => ['nullable', 'boolean'],
            'header_style.footer_strikethrough' => ['nullable', 'boolean'],
            'header_style.footer_line_height' => ['nullable', 'numeric', 'min:1', 'max:2.5'],
            'header_style.body_font_family' => ['nullable', 'string', Rule::in(['system-ui', 'arial', 'calibri', 'times-new-roman', 'georgia', 'courier-new', 'tahoma', 'verdana', 'segoe-ui'])],
            'header_style.body_font_size' => ['nullable', 'integer', 'min:8', 'max:24'],
            'header_style.body_font_weight' => ['nullable', 'string', Rule::in(['400', '500', '600', '650', '700', '800'])],
            'header_style.body_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'header_style.body_font_style' => ['nullable', 'string', Rule::in(['normal', 'italic'])],
            'header_style.body_line_height' => ['nullable', 'numeric', 'min:1', 'max:2.5'],
            'header_style.body_align' => ['nullable', 'string', Rule::in(['left', 'center', 'right', 'justify'])],
            'header_style.sign_block_position' => ['nullable', 'string', Rule::in(['left', 'center', 'right'])],
            'header_style.sign_content_align' => ['nullable', 'string', Rule::in(['left', 'center', 'right'])],
            'header_style.sign_image_align' => ['nullable', 'string', Rule::in(['left', 'center', 'right'])],
            'header_style.sign_meta_align' => ['nullable', 'string', Rule::in(['left', 'center', 'right'])],
            'header_style.sign_align' => ['nullable', 'string', Rule::in(['left', 'center', 'right'])],
            'header_style.sign_meta_layout' => ['nullable', 'string', Rule::in(['inline', 'stack'])],
            'header_style.sign_meta_order' => ['nullable', 'string', Rule::in(['name_first', 'phone_first'])],
            'apply_pdf' => ['nullable', 'boolean'],
            'apply_excel' => ['nullable', 'boolean'],
            'apply_csv' => ['nullable', 'boolean'],
            'show_print_date' => ['nullable', 'boolean'],
            'print_date_label' => ['nullable', 'string', 'max:120'],
            'show_print_row_count' => ['nullable', 'boolean'],
            'show_generated_by' => ['nullable', 'boolean'],
            'column_visibility' => ['nullable', 'array'],
            'column_visibility.pdf' => ['sometimes', 'array'],
            'column_visibility.pdf.*' => ['nullable', 'boolean'],
            'column_visibility.excel' => ['sometimes', 'array'],
            'column_visibility.excel.*' => ['nullable', 'boolean'],
            'column_visibility.csv' => ['sometimes', 'array'],
            'column_visibility.csv.*' => ['nullable', 'boolean'],
            'show_user_signature' => ['nullable', 'boolean'],
            'show_user_name' => ['nullable', 'boolean'],
            'show_user_phone' => ['nullable', 'boolean'],
            'additional_data' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
