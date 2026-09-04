<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHakAksesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fitur_id' => ['sometimes', 'integer', 'exists:fitur_m,id'],
            'slug' => ['sometimes', 'string', 'max:100', Rule::unique('hak_akses_m', 'slug')->ignore($this->route('hak_akses'))],
            'nama' => ['sometimes', 'string', 'max:255'],
            'aksi' => ['sometimes', 'string', Rule::in(['view', 'create', 'update', 'delete', 'execute'])],
        ];
    }
}
