<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDesaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'daerah_id' => ['sometimes', 'integer', 'exists:daerah,id'],
            'kode' => ['sometimes', 'string', 'max:50', Rule::unique('desa', 'kode')->ignore($this->route('desa'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
