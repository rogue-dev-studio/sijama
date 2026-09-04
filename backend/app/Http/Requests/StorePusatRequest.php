<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:13:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:13:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePusatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode' => ['required', 'string', 'max:50', 'unique:wilayah_fung_pusat_m,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'singkatan' => ['nullable', 'string', 'max:8', 'alpha_num'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
