<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 14:10:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 14:10:53
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $includeMeta = (bool) ($this->additional['include_meta'] ?? false);
        $meta = null;
        if ($includeMeta && is_string($this->meta) && $this->meta !== '') {
            $decoded = json_decode($this->meta, true);
            $meta = is_array($decoded) ? $decoded : ['_raw' => $this->meta];
        }

        return [
            'id' => $this->id,
            'module' => $this->module,
            'action' => $this->action,
            'entity_type' => $this->entity_type,
            'entity_id' => $this->entity_id,
            'entity_label' => $this->entity_label,
            'actor_user_id' => $this->actor_user_id,
            'actor_username' => $this->actor_username,
            'actor_name' => $this->actor?->name,
            'summary' => $this->summary,
            'meta' => $meta,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'occurred_at' => $this->occurred_at?->toIso8601String(),
        ];
    }
}
