<?php

namespace App\Http\Requests;

use App\Support\JamaahContactRules;
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

    protected function prepareForValidation(): void
    {
        JamaahContactRules::prepareEmptyContacts($this);
    }

    public function rules(): array
    {
        return [
            'nik' => ['nullable', 'string', 'max:16', 'unique:jamaah_r,nik'],
            'nama' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'string', 'max:20', LookupRules::activeValue(LookupTypes::JENIS_KELAMIN)],
            'tanggal_lahir' => ['nullable', 'date'],
            'pekerjaan' => ['nullable', 'string', 'max:100'],
            'pekerjaan_id' => ['nullable', 'integer', LookupRules::activeId(LookupTypes::PEKERJAAN)],
            'dapukan_ids' => ['nullable', 'array'],
            'dapukan_ids.*' => ['integer', 'exists:dapukan_m,id'],
            'pendidikan' => ['nullable', 'string', 'max:50', LookupRules::activeValue(LookupTypes::PENDIDIKAN)],
            'golongan_darah' => ['nullable', 'string', 'max:20', LookupRules::activeValue(LookupTypes::GOLONGAN_DARAH)],
            'status_pernikahan' => ['nullable', 'string', 'max:32', LookupRules::activeValue(LookupTypes::STATUS_PERNIKAHAN)],
            'alamat' => ['nullable', 'string'],
            'rt' => ['nullable', 'string', 'max:10'],
            'rw' => ['nullable', 'string', 'max:10'],
            'no_hp' => JamaahContactRules::noHp(),
            'email' => JamaahContactRules::email(),
            'status' => ['nullable', Rule::in(['aktif', 'nonaktif'])],
            'foto_path' => ['nullable', 'string', 'max:500'],
            'wilayah_fung_kelompok_id' => ['nullable', 'integer', 'exists:wilayah_fung_kelompok_m,id'],
            'wilayah_adm_desa_id' => ['nullable', 'integer', 'exists:wilayah_adm_desa_m,id'],
            'kode_pos' => ['nullable', 'string', 'regex:/^\d{5}$/'],
        ];
    }
}
