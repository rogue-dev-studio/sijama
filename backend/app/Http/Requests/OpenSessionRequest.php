<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OpenSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['pengajian', 'kegiatan'])],
            'ref_id' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255'],
        ];
    }
}
