<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:17:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:15:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdmKodePosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode' => ['sometimes', 'string', 'regex:/^\d{5}$/'],
            'desa_kelurahan_id' => ['sometimes', 'integer', 'exists:adm_desa_kelurahan,id'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
