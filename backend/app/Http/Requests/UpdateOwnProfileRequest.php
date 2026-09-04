<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 16:44:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:28:00
 */

namespace App\Http\Requests;

use App\Support\JamaahContactRules;
use App\Support\LookupRules;
use App\Support\LookupTypes;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOwnProfileRequest extends FormRequest
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
        $jamaahId = $this->user()?->jamaah_id ? (int) $this->user()->jamaah_id : null;

        return [
            'nama' => ['sometimes', 'required', 'string', 'max:255'],
            'gender' => ['sometimes', 'required', 'string', 'max:20', LookupRules::activeValue(LookupTypes::JENIS_KELAMIN)],
            'tanggal_lahir' => ['nullable', 'date'],
            'pekerjaan_id' => ['sometimes', 'nullable', 'integer', LookupRules::activeId(LookupTypes::PEKERJAAN)],
            'pendidikan' => ['sometimes', 'nullable', 'string', 'max:50', LookupRules::activeValue(LookupTypes::PENDIDIKAN)],
            'golongan_darah' => ['sometimes', 'nullable', 'string', 'max:20', LookupRules::activeValue(LookupTypes::GOLONGAN_DARAH)],
            'status_pernikahan' => ['sometimes', 'nullable', 'string', 'max:32', LookupRules::activeValue(LookupTypes::STATUS_PERNIKAHAN)],
            'alamat' => ['nullable', 'string'],
            'rt' => ['sometimes', 'nullable', 'string', 'max:10'],
            'rw' => ['sometimes', 'nullable', 'string', 'max:10'],
            'no_hp' => ['sometimes', ...JamaahContactRules::noHp($jamaahId)],
            'email' => JamaahContactRules::email($jamaahId),
            'wilayah_adm_desa_id' => ['sometimes', 'nullable', 'integer', 'exists:wilayah_adm_desa_m,id'],
            'kode_pos' => ['sometimes', 'nullable', 'string', 'regex:/^\d{5}$/'],
        ];
    }
}
