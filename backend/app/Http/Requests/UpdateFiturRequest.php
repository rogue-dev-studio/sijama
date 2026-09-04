<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFiturRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'menu_id' => ['sometimes', 'integer', 'exists:menu_m,id'],
            'slug' => ['sometimes', 'string', 'max:50', Rule::unique('fitur_m', 'slug')->ignore($this->route('fitur'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
