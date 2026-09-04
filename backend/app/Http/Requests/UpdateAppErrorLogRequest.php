<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 17:46:40
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:46:40
 */

namespace App\Http\Requests;

use App\Services\AppErrorLogService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppErrorLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(AppErrorLogService::STATUSES)],
            'status_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
