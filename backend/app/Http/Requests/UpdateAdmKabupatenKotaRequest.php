<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:15:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:15:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmKabupatenKotaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'provinsi_id' => ['sometimes', 'integer', 'exists:adm_provinsi,id'],
            'kode' => ['sometimes', 'string', 'max:16', Rule::unique('adm_kabupaten_kota', 'kode')->ignore($this->route('adm_kabupaten_kota'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'jenis' => ['sometimes', Rule::in(['kabupaten', 'kota'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
