<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\RejectsKodeChangeUnlessSuperAdmin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDesaRequest extends FormRequest
{
    use RejectsKodeChangeUnlessSuperAdmin;

    protected function columnPermissionPrefix(): string
    {
        return 'wilayah_fung_desa';
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wilayah_fung_daerah_id' => ['sometimes', 'integer', 'exists:wilayah_fung_daerah_m,id'],
            'kode' => ['sometimes', 'string', 'max:50', Rule::unique('wilayah_fung_desa_m', 'kode')->ignore($this->route('wilayah_fung_desa'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'singkatan' => ['sometimes', 'nullable', 'string', 'max:8', 'alpha_num'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
