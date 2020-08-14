<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:14:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:14:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmDesaKelurahanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kecamatan_id' => ['sometimes', 'integer', 'exists:adm_kecamatan,id'],
            'kode' => ['sometimes', 'string', 'max:32', Rule::unique('adm_desa_kelurahan', 'kode')->ignore($this->route('adm_desa_kelurahan'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'jenis' => ['sometimes', Rule::in(['desa', 'kelurahan', 'desa_adat'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
