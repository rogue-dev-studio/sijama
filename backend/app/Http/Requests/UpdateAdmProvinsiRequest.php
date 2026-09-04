<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:19:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:19:00
 */

namespace App\Http\Requests;

use App\Http\Requests\Concerns\RejectsKodeChangeUnlessSuperAdmin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmProvinsiRequest extends FormRequest
{
    use RejectsKodeChangeUnlessSuperAdmin;

    protected function columnPermissionPrefix(): string
    {
        return 'wilayah_adm_provinsi';
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wilayah_adm_negara_id' => ['sometimes', 'integer', 'exists:wilayah_adm_negara_m,id'],
            'kode' => ['sometimes', 'string', 'max:8', Rule::unique('wilayah_adm_provinsi_m', 'kode')->ignore($this->route('wilayah_adm_provinsi'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'singkatan' => ['sometimes', 'nullable', 'string', 'max:8', Rule::unique('wilayah_adm_provinsi_m', 'singkatan')->ignore($this->route('wilayah_adm_provinsi'))],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
