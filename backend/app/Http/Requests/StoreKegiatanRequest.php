<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKegiatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'judul' => ['required', 'string', 'max:255'],
            'jenis' => ['nullable', 'string', 'max:100'],
            'kategori_kegiatan_id' => ['nullable', 'integer', 'exists:kategori_kegiatan,id'],
            'tanggal' => ['required', 'date'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'lokasi_id' => ['nullable', 'integer', 'exists:lokasi,id'],
            'deskripsi' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['planned', 'ongoing', 'completed', 'cancelled'])],
        ];
    }
}
