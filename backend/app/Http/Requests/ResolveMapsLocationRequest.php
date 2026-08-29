<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 14:30:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResolveMapsLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'input' => ['required', 'string', 'max:20000'],
        ];
    }
}
