<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:16:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:16:00
 */

namespace App\Http\Requests;

use App\Http\Requests\Concerns\RejectsKodeChangeUnlessSuperAdmin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmKecamatanRequest extends FormRequest
{
    use RejectsKodeChangeUnlessSuperAdmin;

    protected function columnPermissionPrefix(): string
    {
        return 'wilayah_adm_kecamatan';
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wilayah_adm_kabupaten_kota_id' => ['sometimes', 'integer', 'exists:wilayah_adm_kabupaten_kota_m,id'],
            'kode' => ['sometimes', 'string', 'max:24', Rule::unique('wilayah_adm_kecamatan_m', 'kode')->ignore($this->route('wilayah_adm_kecamatan'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
