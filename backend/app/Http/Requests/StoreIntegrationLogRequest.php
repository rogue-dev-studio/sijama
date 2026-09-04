<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 15:51:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 15:51:00
 */

namespace App\Http\Requests;

use App\Services\IntegrationLogService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIntegrationLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'provider' => ['required', 'string', Rule::in(IntegrationLogService::PROVIDERS)],
            'level' => ['nullable', 'string', Rule::in(IntegrationLogService::LEVELS)],
            'event_type' => ['required', 'string', Rule::in(IntegrationLogService::EVENT_TYPES)],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            'context' => ['nullable', 'array'],
        ];
    }
}
