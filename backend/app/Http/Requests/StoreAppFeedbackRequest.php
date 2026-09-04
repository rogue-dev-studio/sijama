<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:20:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reporter_name' => ['required', 'string', 'max:150'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'role_label' => ['nullable', 'string', 'max:120'],
            'contact' => ['nullable', 'string', 'max:120'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'max:2048'],
        ];
    }
}
