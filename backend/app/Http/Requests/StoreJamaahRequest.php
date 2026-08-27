<?php

namespace App\Http\Requests;

use App\Support\LookupRules;
use App\Support\LookupTypes;
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
            'gender' => ['required', 'string', 'max:20', LookupRules::activeValue(LookupTypes::JENIS_KELAMIN)],
            'tanggal_lahir' => ['nullable', 'date'],
            'pekerjaan' => ['nullable', 'string', 'max:100'],
            'pekerjaan_id' => ['nullable', 'integer', LookupRules::activeId(LookupTypes::PEKERJAAN)],
            'dapukan_ids' => ['nullable', 'array'],
            'dapukan_ids.*' => ['integer', 'exists:dapukan,id'],
            'pendidikan' => ['nullable', 'string', 'max:50', LookupRules::activeValue(LookupTypes::PENDIDIKAN)],
            'golongan_darah' => ['nullable', 'string', 'max:20', LookupRules::activeValue(LookupTypes::GOLONGAN_DARAH)],
            'status_pernikahan' => ['nullable', 'string', 'max:32', LookupRules::activeValue(LookupTypes::STATUS_PERNIKAHAN)],
            'alamat' => ['nullable', 'string'],
            'rt' => ['nullable', 'string', 'max:10'],
            'rw' => ['nullable', 'string', 'max:10'],
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
