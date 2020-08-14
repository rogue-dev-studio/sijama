<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:10:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:10:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdmKodePosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode' => ['required', 'string', 'regex:/^\d{5}$/'],
            'desa_kelurahan_id' => ['nullable', 'integer', 'exists:adm_desa_kelurahan,id'],
            'kecamatan_id' => ['nullable', 'integer', 'exists:adm_kecamatan,id'],
            'nama_wilayah' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
