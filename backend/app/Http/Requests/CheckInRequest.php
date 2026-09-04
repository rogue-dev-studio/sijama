<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jamaah_id' => ['required', 'integer', 'exists:jamaah_r,id'],
            'method' => ['required', Rule::in(['face', 'manual'])],
            'matched_distance' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
