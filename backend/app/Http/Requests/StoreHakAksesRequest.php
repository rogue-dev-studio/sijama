<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHakAksesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fitur_id' => ['required', 'integer', 'exists:fitur_m,id'],
            'slug' => ['required', 'string', 'max:100', 'unique:hak_akses_m,slug'],
            'nama' => ['required', 'string', 'max:255'],
            'aksi' => ['required', 'string', Rule::in(['view', 'create', 'update', 'delete', 'execute'])],
        ];
    }
}
