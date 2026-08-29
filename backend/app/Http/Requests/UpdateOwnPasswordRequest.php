<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 13:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 13:20:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOwnPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.current_password' => 'Password saat ini tidak sesuai.',
            'password.min' => 'Password baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ];
    }
}
