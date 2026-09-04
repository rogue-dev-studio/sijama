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
            'wilayah_adm_provinsi_id' => ['required', 'integer', 'exists:wilayah_adm_provinsi_m,id'],
            'kode' => ['required', 'string', 'max:16', 'unique:wilayah_adm_kabupaten_kota_m,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'jenis' => ['required', Rule::in(['kabupaten', 'kota'])],
            'singkatan' => ['nullable', 'string', 'size:3', 'alpha_num'],
            'singkatan_kawasan_metropolitan' => ['nullable', 'string', 'max:64'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
