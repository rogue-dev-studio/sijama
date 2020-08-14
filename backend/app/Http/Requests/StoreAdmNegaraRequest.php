<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:11:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:11:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdmNegaraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode' => ['required', 'string', 'max:8', 'unique:adm_negara,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'iso3' => ['nullable', 'string', 'size:3'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
