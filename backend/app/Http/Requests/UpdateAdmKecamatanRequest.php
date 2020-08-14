<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:16:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:16:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmKecamatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kabupaten_kota_id' => ['sometimes', 'integer', 'exists:adm_kabupaten_kota,id'],
            'kode' => ['sometimes', 'string', 'max:24', Rule::unique('adm_kecamatan', 'kode')->ignore($this->route('adm_kecamatan'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
