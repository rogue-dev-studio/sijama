<?php

namespace App\Http\Requests;

use App\Support\LokasiJenis;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLokasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['sometimes', 'required', 'string', 'max:255'],
            'jenis' => ['sometimes', 'required', 'string', Rule::in(LokasiJenis::VALUES)],
            'kota' => ['nullable', 'string', 'max:100'],
            'adm_desa_kelurahan_id' => ['nullable', 'integer', 'exists:adm_desa_kelurahan,id'],
            'alamat' => ['nullable', 'string'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
