<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 15:51:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 15:51:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IntegrationLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'level' => $this->level,
            'event_type' => $this->event_type,
            'title' => $this->title,
            'message' => $this->message,
            'context' => $this->context(),
            'occurred_at' => $this->occurred_at?->toIso8601String(),
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', fn () => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'username' => $this->creator->username,
            ] : null),
        ];
    }
}
