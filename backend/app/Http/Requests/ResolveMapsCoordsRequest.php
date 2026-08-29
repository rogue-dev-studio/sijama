<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 14:42:39
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 14:42:39
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResolveMapsCoordsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
        ];
    }
}
