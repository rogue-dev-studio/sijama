<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMasterUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => [
                'sometimes',
                'string',
                'max:64',
                'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique('users', 'username')->ignore($this->route('user')),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'jamaah_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:jamaah,id',
                Rule::unique('users', 'jamaah_id')->ignore($this->route('user')),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
