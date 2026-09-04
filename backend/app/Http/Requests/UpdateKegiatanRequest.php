<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKegiatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'judul' => ['sometimes', 'required', 'string', 'max:255'],
            'pemateri' => ['nullable', 'string', 'max:255'],
            'pemateri_id' => ['nullable', 'integer', 'exists:pemateri_m,id'],
            'materi_ids' => ['nullable', 'array'],
            'materi_ids.*' => ['integer', 'exists:materi_m,id'],
            'jenis' => ['nullable', 'string', 'max:100'],
            'kategori_kegiatan_id' => ['nullable', 'integer', 'exists:kategori_kegiatan_m,id'],
            'tanggal' => ['sometimes', 'required', 'date'],
            'jam_mulai' => ['nullable', 'date_format:H:i'],
            'jam_selesai' => ['nullable', 'date_format:H:i'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'lokasi_id' => ['nullable', 'integer', 'exists:lokasi_m,id'],
            'deskripsi' => ['nullable', 'string'],
            'catatan' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['planned', 'ongoing', 'completed', 'cancelled'])],
        ];
    }
}
