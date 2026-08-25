<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 14:50:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchMapsPlacesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q' => ['required', 'string', 'min:2', 'max:255'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:10'],
        ];
    }
}
