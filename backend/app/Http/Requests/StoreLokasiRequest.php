<?php

namespace App\Http\Requests;

use App\Support\LokasiJenis;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLokasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:255'],
            'jenis' => ['required', 'string', Rule::in(LokasiJenis::VALUES)],
            'kota' => ['nullable', 'string', 'max:100'],
            'wilayah_adm_desa_id' => ['nullable', 'integer', 'exists:wilayah_adm_desa_m,id'],
            'alamat' => ['nullable', 'string'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'maps_place_id' => ['nullable', 'string', 'max:120'],
            'maps_place_name' => ['nullable', 'string', 'max:255'],
            'maps_url' => ['nullable', 'string', 'max:2000'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
