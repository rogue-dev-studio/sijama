<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\RejectsKodeChangeUnlessSuperAdmin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubKelompokRequest extends FormRequest
{
    use RejectsKodeChangeUnlessSuperAdmin;

    protected function columnPermissionPrefix(): string
    {
        return 'wilayah_fung_sub_kelompok';
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('wilayah_fung_sub_kelompok');

        return [
            'wilayah_fung_kelompok_id' => ['sometimes', 'required', 'integer', 'exists:wilayah_fung_kelompok_m,id'],
            'kode' => ['sometimes', 'nullable', 'string', 'max:50', Rule::unique('wilayah_fung_sub_kelompok_m', 'kode')->ignore($id)],
            'nama' => ['sometimes', 'required', 'string', 'max:255'],
            'singkatan' => ['sometimes', 'nullable', 'string', 'max:8', 'alpha_num'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
