<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 15:02:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 15:02:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadProfileSignatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:2048', 'mimes:jpeg,jpg,png,gif,webp'],
        ];
    }
}
