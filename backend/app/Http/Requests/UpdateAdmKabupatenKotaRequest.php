<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:15:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:15:00
 */

namespace App\Http\Requests;

use App\Http\Requests\Concerns\RejectsKodeChangeUnlessSuperAdmin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmKabupatenKotaRequest extends FormRequest
{
    use RejectsKodeChangeUnlessSuperAdmin;

    protected function columnPermissionPrefix(): string
    {
        return 'wilayah_adm_kabupaten_kota';
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wilayah_adm_provinsi_id' => ['sometimes', 'integer', 'exists:wilayah_adm_provinsi_m,id'],
            'kode' => ['sometimes', 'string', 'max:16', Rule::unique('wilayah_adm_kabupaten_kota_m', 'kode')->ignore($this->route('wilayah_adm_kabupaten_kota'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'jenis' => ['sometimes', Rule::in(['kabupaten', 'kota'])],
            'singkatan' => ['sometimes', 'nullable', 'string', 'size:3', 'alpha_num'],
            'singkatan_kawasan_metropolitan' => ['sometimes', 'nullable', 'string', 'max:64'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
