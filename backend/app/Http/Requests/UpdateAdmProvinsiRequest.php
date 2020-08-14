<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:19:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:19:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmProvinsiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'negara_id' => ['sometimes', 'integer', 'exists:adm_negara,id'],
            'kode' => ['sometimes', 'string', 'max:8', Rule::unique('adm_provinsi', 'kode')->ignore($this->route('adm_provinsi'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
