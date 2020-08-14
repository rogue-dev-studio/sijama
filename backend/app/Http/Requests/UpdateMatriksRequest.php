<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMatriksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hak_akses_ids' => ['required', 'array'],
            'hak_akses_ids.*' => ['integer', 'exists:hak_akses,id'],
        ];
    }
}
