<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubKelompokRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wilayah_fung_kelompok_id' => ['required', 'integer', 'exists:wilayah_fung_kelompok_m,id'],
            'kode' => ['nullable', 'string', 'max:50', 'unique:wilayah_fung_sub_kelompok_m,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'singkatan' => ['nullable', 'string', 'max:8', 'alpha_num'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
