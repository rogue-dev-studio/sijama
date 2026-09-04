<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDesaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wilayah_fung_daerah_id' => ['required', 'integer', 'exists:wilayah_fung_daerah_m,id'],
            'kode' => ['required', 'string', 'max:50', 'unique:wilayah_fung_desa_m,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'singkatan' => ['nullable', 'string', 'max:8', 'alpha_num'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
