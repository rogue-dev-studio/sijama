<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 13:52:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 13:52:49
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppErrorLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $includeTrace = (bool) ($this->additional['include_trace'] ?? false);

        return [
            'id' => $this->id,
            'level' => $this->level,
            'status' => $this->status ?? 'baru',
            'status_note' => $this->status_note,
            'status_updated_at' => $this->status_updated_at?->toIso8601String(),
            'status_updated_by' => $this->status_updated_by,
            'status_updated_by_name' => $this->statusUpdatedBy?->name,
            'status_updated_by_username' => $this->statusUpdatedBy?->username,
            'exception_class' => $this->exception_class,
            'message' => $this->message,
            'file' => $this->file,
            'line' => $this->line,
            'stack_trace' => $includeTrace ? $this->stack_trace : null,
            'request_method' => $this->request_method,
            'request_path' => $this->request_path,
            'user_id' => $this->user_id,
            'user_name' => $this->user?->name,
            'user_username' => $this->user?->username,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'occurred_at' => $this->occurred_at?->toIso8601String(),
        ];
    }
}
