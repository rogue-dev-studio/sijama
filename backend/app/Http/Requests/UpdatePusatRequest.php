<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:20:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:20:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePusatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode' => ['sometimes', 'string', 'max:50', Rule::unique('pusat', 'kode')->ignore($this->route('pusat'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
