<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 17:41:32
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:41:32
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadKonfigDokumenAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset' => ['required', 'string', Rule::in(['logo-kiri', 'logo-kanan'])],
            'file' => ['required', 'file', 'max:2048', 'mimes:jpeg,jpg,png,gif,webp,svg'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'asset' => $this->route('asset'),
        ]);
    }
}
