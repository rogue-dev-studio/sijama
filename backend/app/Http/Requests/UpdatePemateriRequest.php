<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePemateriRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('pemateri');

        return [
            'kode' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('pemateri', 'kode')->ignore($id)],
            'jamaah_id' => ['sometimes', 'required', 'integer', 'exists:jamaah,id', Rule::unique('pemateri', 'jamaah_id')->ignore($id)],
            'nama' => ['nullable', 'string', 'max:255'],
            'kontak' => ['nullable', 'string', 'max:50'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
