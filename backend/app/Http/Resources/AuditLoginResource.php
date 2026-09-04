<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 13:36:09
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 13:36:09
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLoginResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event' => $this->event,
            'success' => (bool) $this->success,
            'username' => $this->username,
            'user_id' => $this->user_id,
            'user_name' => $this->user?->name,
            'user_username' => $this->user?->username,
            'failure_reason' => $this->failure_reason,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'remember_me' => $this->remember_me,
            'device_key' => $this->device_key,
            'personal_access_token_id' => $this->personal_access_token_id,
            'attempted_at' => $this->attempted_at?->toIso8601String(),
        ];
    }
}
