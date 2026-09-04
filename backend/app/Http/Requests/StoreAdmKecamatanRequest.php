<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:09:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:09:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdmKecamatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wilayah_adm_kabupaten_kota_id' => ['required', 'integer', 'exists:wilayah_adm_kabupaten_kota_m,id'],
            'kode' => ['required', 'string', 'max:24', 'unique:wilayah_adm_kecamatan_m,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
