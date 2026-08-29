<?php

namespace App\Http\Requests;

use App\Support\JamaahContactRules;
use App\Support\LookupRules;
use App\Support\LookupTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJamaahRequest extends FormRequest
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
        $jamaahId = (int) $this->route('jamaah');

        return [
            'nik' => ['nullable', 'string', 'max:16', Rule::unique('jamaah', 'nik')->ignore($jamaahId)],
            'nama' => ['sometimes', 'required', 'string', 'max:255'],
            'gender' => ['sometimes', 'required', 'string', 'max:20', LookupRules::activeValue(LookupTypes::JENIS_KELAMIN)],
            'tanggal_lahir' => ['nullable', 'date'],
            'pekerjaan' => ['sometimes', 'nullable', 'string', 'max:100'],
            'pekerjaan_id' => ['sometimes', 'nullable', 'integer', LookupRules::activeId(LookupTypes::PEKERJAAN)],
            'dapukan_ids' => ['sometimes', 'nullable', 'array'],
            'dapukan_ids.*' => ['integer', 'exists:dapukan,id'],
            'pendidikan' => ['sometimes', 'nullable', 'string', 'max:50', LookupRules::activeValue(LookupTypes::PENDIDIKAN)],
            'golongan_darah' => ['sometimes', 'nullable', 'string', 'max:20', LookupRules::activeValue(LookupTypes::GOLONGAN_DARAH)],
            'status_pernikahan' => ['sometimes', 'nullable', 'string', 'max:32', LookupRules::activeValue(LookupTypes::STATUS_PERNIKAHAN)],
            'alamat' => ['nullable', 'string'],
            'rt' => ['sometimes', 'nullable', 'string', 'max:10'],
            'rw' => ['sometimes', 'nullable', 'string', 'max:10'],
            'no_hp' => ['sometimes', ...JamaahContactRules::noHp($jamaahId)],
            'email' => JamaahContactRules::email($jamaahId),
            'status' => ['nullable', Rule::in(['aktif', 'nonaktif'])],
            'foto_path' => ['nullable', 'string', 'max:500'],
            'kelompok_id' => ['sometimes', 'nullable', 'integer', 'exists:kelompok,id'],
            'adm_desa_kelurahan_id' => ['sometimes', 'nullable', 'integer', 'exists:adm_desa_kelurahan,id'],
            'kode_pos' => ['sometimes', 'nullable', 'string', 'regex:/^\d{5}$/'],
        ];
    }
}
