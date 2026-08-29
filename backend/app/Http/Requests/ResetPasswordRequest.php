<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'token' => ['nullable', 'string', 'max:255'],
            'otp' => ['nullable', 'string', 'size:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'identifier.required' => 'Email atau nomor HP wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'otp.size' => 'Kode OTP harus 6 digit.',
        ];
    }
}
