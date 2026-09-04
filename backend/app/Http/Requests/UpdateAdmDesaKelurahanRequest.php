<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:14:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:14:00
 */

namespace App\Http\Requests;

use App\Http\Requests\Concerns\RejectsKodeChangeUnlessSuperAdmin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmDesaKelurahanRequest extends FormRequest
{
    use RejectsKodeChangeUnlessSuperAdmin;

    protected function columnPermissionPrefix(): string
    {
        return 'wilayah_adm_desa';
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wilayah_adm_kecamatan_id' => ['sometimes', 'integer', 'exists:wilayah_adm_kecamatan_m,id'],
            'kode' => ['sometimes', 'string', 'max:32', Rule::unique('wilayah_adm_desa_m', 'kode')->ignore($this->route('wilayah_adm_desa'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'jenis' => ['sometimes', Rule::in(['desa', 'kelurahan', 'desa_adat'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
