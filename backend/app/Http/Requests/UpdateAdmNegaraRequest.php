<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:18:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:18:00
 */

namespace App\Http\Requests;

use App\Http\Requests\Concerns\RejectsKodeChangeUnlessSuperAdmin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmNegaraRequest extends FormRequest
{
    use RejectsKodeChangeUnlessSuperAdmin;

    protected function columnPermissionPrefix(): string
    {
        return 'wilayah_adm_negara';
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode' => ['sometimes', 'string', 'max:8', Rule::unique('wilayah_adm_negara_m', 'kode')->ignore($this->route('wilayah_adm_negara'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'iso3' => ['nullable', 'string', 'size:3'],
            'singkatan' => ['sometimes', 'nullable', 'string', 'max:8', Rule::unique('wilayah_adm_negara_m', 'singkatan')->ignore($this->route('wilayah_adm_negara'))],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
