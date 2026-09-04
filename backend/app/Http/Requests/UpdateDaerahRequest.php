<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\RejectsKodeChangeUnlessSuperAdmin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDaerahRequest extends FormRequest
{
    use RejectsKodeChangeUnlessSuperAdmin;

    protected function columnPermissionPrefix(): string
    {
        return 'wilayah_fung_daerah';
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wilayah_fung_pusat_id' => ['sometimes', 'integer', 'exists:wilayah_fung_pusat_m,id'],
            'kode' => ['sometimes', 'string', 'max:50', Rule::unique('wilayah_fung_daerah_m', 'kode')->ignore($this->route('wilayah_fung_daerah'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'singkatan' => ['sometimes', 'nullable', 'string', 'max:8', 'alpha_num'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
