<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePengajianRequest extends FormRequest
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
            'pemateri_id' => ['nullable', 'integer', 'exists:pemateri,id'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'lokasi_id' => ['nullable', 'integer', 'exists:lokasi,id'],
            'materi_id' => ['nullable', 'integer', 'exists:materi,id'],
            'kategori_kegiatan_id' => ['nullable', 'integer', 'exists:kategori_kegiatan,id'],
            'starts_at' => ['sometimes', 'required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'catatan' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['scheduled', 'completed', 'cancelled'])],
        ];
    }
}
