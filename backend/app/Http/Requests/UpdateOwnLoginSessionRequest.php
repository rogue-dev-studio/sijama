<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 13:35:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 13:40:00
 */

namespace App\Http\Requests;

use App\Support\LoginRememberOptions;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOwnLoginSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('login_remember_minutes') && $this->input('login_remember_minutes') === '') {
            $this->merge(['login_remember_minutes' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'login_remember_minutes' => [
                'nullable',
                'integer',
                'min:'.LoginRememberOptions::MIN_MINUTES,
                'max:'.LoginRememberOptions::MAX_MINUTES,
            ],
            'login_remember_until_logout' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'login_remember_minutes.integer' => 'Durasi sesi login harus berupa angka bulat (menit).',
            'login_remember_minutes.min' => 'Durasi sesi login minimal '.LoginRememberOptions::MIN_MINUTES.' menit.',
            'login_remember_minutes.max' => 'Durasi sesi login maksimal '.LoginRememberOptions::MAX_MINUTES.' menit.',
        ];
    }
}
