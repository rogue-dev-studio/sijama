<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EnrollFaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'face_descriptor' => ['required', 'array', 'min:1'],
            'face_descriptor.*' => ['numeric'],
        ];
    }
}
