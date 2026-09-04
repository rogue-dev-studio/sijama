<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDapukanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'slug' => ['sometimes', 'string', 'max:50', Rule::unique('dapukan_m', 'slug')->ignore($this->route('dapukan'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'urutan' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
