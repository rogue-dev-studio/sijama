<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:55:00
 */

namespace App\Http\Requests;

use App\Services\AppReportService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(AppReportService::STATUSES)],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
