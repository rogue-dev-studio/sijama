<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 16:44:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 16:44:59
 */

namespace App\Http\Requests;

use App\Support\JamaahPendidikan;
use App\Support\JamaahStatusPernikahan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOwnProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['sometimes', 'required', 'string', 'max:255'],
            'gender' => ['sometimes', 'required', Rule::in(['L', 'P'])],
            'tanggal_lahir' => ['nullable', 'date'],
            'pekerjaan_id' => ['sometimes', 'nullable', 'integer', 'exists:pekerjaan,id'],
            'pendidikan' => ['sometimes', 'nullable', 'string', Rule::in(JamaahPendidikan::VALUES)],
            'status_pernikahan' => ['sometimes', 'nullable', 'string', Rule::in(JamaahStatusPernikahan::VALUES)],
            'alamat' => ['nullable', 'string'],
            'rt' => ['sometimes', 'required', 'string', 'max:10'],
            'rw' => ['sometimes', 'required', 'string', 'max:10'],
            'no_hp' => ['sometimes', 'required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'adm_desa_kelurahan_id' => ['sometimes', 'nullable', 'integer', 'exists:adm_desa_kelurahan,id'],
            'kode_pos' => ['sometimes', 'nullable', 'string', 'regex:/^\d{5}$/'],
        ];
    }
}
