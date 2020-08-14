<?php

namespace App\Http\Requests;

use App\Support\JamaahPendidikan;
use App\Support\JamaahStatusPernikahan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJamaahRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $jamaahId = $this->route('jamaah');

        return [
            'nik' => ['nullable', 'string', 'max:16', Rule::unique('jamaah', 'nik')->ignore($jamaahId)],
            'nama' => ['sometimes', 'required', 'string', 'max:255'],
            'gender' => ['sometimes', 'required', Rule::in(['L', 'P'])],
            'tanggal_lahir' => ['nullable', 'date'],
            'pekerjaan' => ['sometimes', 'nullable', 'string', 'max:100'],
            'pekerjaan_id' => ['sometimes', 'nullable', 'integer', 'exists:pekerjaan,id'],
            'dapukan_ids' => ['sometimes', 'nullable', 'array'],
            'dapukan_ids.*' => ['integer', 'exists:dapukan,id'],
            'pendidikan' => ['sometimes', 'nullable', 'string', Rule::in(JamaahPendidikan::VALUES)],
            'status_pernikahan' => ['sometimes', 'nullable', 'string', Rule::in(JamaahStatusPernikahan::VALUES)],
            'alamat' => ['nullable', 'string'],
            'rt' => ['sometimes', 'required', 'string', 'max:10'],
            'rw' => ['sometimes', 'required', 'string', 'max:10'],
            'no_hp' => ['sometimes', 'required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'status' => ['nullable', Rule::in(['aktif', 'nonaktif'])],
            'foto_path' => ['nullable', 'string', 'max:500'],
            'kelompok_id' => ['sometimes', 'nullable', 'integer', 'exists:kelompok,id'],
            'adm_desa_kelurahan_id' => ['sometimes', 'nullable', 'integer', 'exists:adm_desa_kelurahan,id'],
            'kode_pos' => ['sometimes', 'nullable', 'string', 'regex:/^\d{5}$/'],
        ];
    }
}
