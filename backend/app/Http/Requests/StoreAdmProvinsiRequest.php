<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:12:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:12:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdmProvinsiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'negara_id' => ['required', 'integer', 'exists:adm_negara,id'],
            'kode' => ['required', 'string', 'max:8', 'unique:adm_provinsi,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
