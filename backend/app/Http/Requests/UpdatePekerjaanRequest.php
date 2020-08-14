<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:06:41
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:06:41
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePekerjaanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('pekerjaan');

        return [
            'kode' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('pekerjaan', 'kode')->ignore($id)],
            'nama' => ['sometimes', 'required', 'string', 'max:100'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
