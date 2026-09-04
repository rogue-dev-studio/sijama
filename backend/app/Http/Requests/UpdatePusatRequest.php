<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:20:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:20:00
 */

namespace App\Http\Requests;

use App\Http\Requests\Concerns\RejectsKodeChangeUnlessSuperAdmin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePusatRequest extends FormRequest
{
    use RejectsKodeChangeUnlessSuperAdmin;

    protected function columnPermissionPrefix(): string
    {
        return 'wilayah_fung_pusat';
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode' => ['sometimes', 'string', 'max:50', Rule::unique('wilayah_fung_pusat_m', 'kode')->ignore($this->route('wilayah_fung_pusat'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'singkatan' => ['sometimes', 'nullable', 'string', 'max:8', 'alpha_num'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
