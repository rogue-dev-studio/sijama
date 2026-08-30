<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 17:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:20:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadShareExportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimetypes:application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain',
            ],
        ];
    }
}
