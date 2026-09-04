<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:55:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppPollRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'is_active' => ['sometimes', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'options' => ['sometimes', 'array', 'min:2'],
            'options.*.id' => ['nullable', 'integer'],
            'options.*.label' => ['required_with:options', 'string', 'max:255'],
            'options.*.urutan' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
