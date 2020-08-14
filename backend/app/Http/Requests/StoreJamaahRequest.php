<?php

namespace App\Http\Requests;

use App\Support\JamaahPendidikan;
use App\Support\JamaahStatusPernikahan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJamaahRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nik' => ['nullable', 'string', 'max:16', 'unique:jamaah,nik'],
            'nama' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::in(['L', 'P'])],
            'tanggal_lahir' => ['nullable', 'date'],
            'pekerjaan' => ['nullable', 'string', 'max:100'],
            'pekerjaan_id' => ['nullable', 'integer', 'exists:pekerjaan,id'],
            'dapukan_ids' => ['nullable', 'array'],
            'dapukan_ids.*' => ['integer', 'exists:dapukan,id'],
            'pendidikan' => ['nullable', 'string', Rule::in(JamaahPendidikan::VALUES)],
            'status_pernikahan' => ['nullable', 'string', Rule::in(JamaahStatusPernikahan::VALUES)],
            'alamat' => ['nullable', 'string'],
            'rt' => ['required', 'string', 'max:10'],
            'rw' => ['required', 'string', 'max:10'],
            'no_hp' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'status' => ['nullable', Rule::in(['aktif', 'nonaktif'])],
            'foto_path' => ['nullable', 'string', 'max:500'],
            'kelompok_id' => ['nullable', 'integer', 'exists:kelompok,id'],
            'adm_desa_kelurahan_id' => ['nullable', 'integer', 'exists:adm_desa_kelurahan,id'],
            'kode_pos' => ['nullable', 'string', 'regex:/^\d{5}$/'],
        ];
    }
}
