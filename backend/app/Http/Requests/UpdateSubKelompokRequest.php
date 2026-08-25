<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubKelompokRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('sub_kelompok');

        return [
            'kelompok_id' => ['sometimes', 'required', 'integer', 'exists:kelompok,id'],
            'kode' => ['sometimes', 'nullable', 'string', 'max:50', Rule::unique('sub_kelompok', 'kode')->ignore($id)],
            'nama' => ['sometimes', 'required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
