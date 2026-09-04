<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

namespace App\Http\Requests;

use App\Support\LookupRules;
use App\Support\LookupTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKeluargaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return $this->baseRules();
    }

    protected function baseRules(): array
    {
        return [
            'wilayah_fung_kelompok_id' => ['nullable', 'integer', 'exists:wilayah_fung_kelompok_m,id'],
            'kepala_jamaah_id' => ['required', 'integer', 'exists:jamaah_r,id'],
            'no_kk' => ['nullable', 'string', 'max:16'],
            'alamat' => ['nullable', 'string'],
            'rt' => ['nullable', 'string', 'max:10'],
            'rw' => ['nullable', 'string', 'max:10'],
            'wilayah_adm_desa_id' => ['nullable', 'integer', 'exists:wilayah_adm_desa_m,id'],
            'kode_pos' => ['nullable', 'string', 'regex:/^\d{5}$/'],
            'catatan' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['aktif', 'nonaktif'])],
            'anggota' => ['nullable', 'array'],
            'anggota.*.jamaah_id' => ['required', 'integer', 'exists:jamaah_r,id', 'distinct'],
            'anggota.*.hubungan_keluarga' => [
                'required',
                'string',
                'max:32',
                LookupRules::activeValue(LookupTypes::HUBUNGAN_KELUARGA),
            ],
            'anggota.*.is_kepala_keluarga' => ['nullable', 'boolean'],
            'anggota.*.catatan' => ['nullable', 'string'],
        ];
    }
}
