<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:07:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:07:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdmDesaKelurahanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wilayah_adm_kecamatan_id' => ['required', 'integer', 'exists:wilayah_adm_kecamatan_m,id'],
            'kode' => ['required', 'string', 'max:32', 'unique:wilayah_adm_desa_m,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'jenis' => ['required', Rule::in(['desa', 'kelurahan', 'desa_adat'])],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
