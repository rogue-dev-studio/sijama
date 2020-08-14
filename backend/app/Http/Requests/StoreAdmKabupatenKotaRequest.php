<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:08:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:08:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdmKabupatenKotaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'provinsi_id' => ['required', 'integer', 'exists:adm_provinsi,id'],
            'kode' => ['required', 'string', 'max:16', 'unique:adm_kabupaten_kota,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'jenis' => ['required', Rule::in(['kabupaten', 'kota'])],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
