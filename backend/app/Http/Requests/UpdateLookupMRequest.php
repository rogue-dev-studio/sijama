<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:23:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:23:49
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLookupMRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lookup_type' => ['sometimes', 'required', 'string', 'max:100'],
            'lookup_name' => ['nullable', 'string', 'max:200'],
            'lookup_value' => ['nullable', 'string', 'max:200'],
            'lookup_urutan' => ['nullable', 'integer'],
            'lookup_kode' => ['nullable', 'string', 'max:50'],
            'additional_data' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
