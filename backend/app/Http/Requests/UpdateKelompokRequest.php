<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKelompokRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'desa_id' => ['sometimes', 'integer', 'exists:desa,id'],
            'kode' => ['sometimes', 'string', 'max:50', Rule::unique('kelompok', 'kode')->ignore($this->route('kelompok'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
