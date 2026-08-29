<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:24:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:24:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadKonfigAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset' => ['required', 'string', Rule::in(['logo-header', 'favicon', 'logo-footer', 'background', 'maintenance-background'])],
            'file' => ['required', 'file', 'max:2048', 'mimes:jpeg,jpg,png,gif,webp,svg,ico'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'asset' => $this->route('asset'),
        ]);
    }
}
