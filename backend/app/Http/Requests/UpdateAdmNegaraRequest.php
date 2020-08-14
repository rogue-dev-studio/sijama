<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:18:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:18:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmNegaraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode' => ['sometimes', 'string', 'max:8', Rule::unique('adm_negara', 'kode')->ignore($this->route('adm_negara'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'iso3' => ['nullable', 'string', 'size:3'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
