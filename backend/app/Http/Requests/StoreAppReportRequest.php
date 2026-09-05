<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-05 19:10:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reporter_name' => ['required', 'string', 'max:150'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'contact' => ['nullable', 'string', 'max:120'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'reporter_name.required' => 'Nama pelapor wajib diisi.',
            'subject.required' => 'Subjek wajib diisi.',
            'description.required' => 'Deskripsi wajib diisi.',
            'images.max' => 'Maksimal 5 gambar.',
            'images.*.mimes' => 'Gambar harus JPG, PNG, GIF, atau WebP.',
            'images.*.max' => 'Setiap gambar maksimal 5 MB.',
        ];
    }
}
