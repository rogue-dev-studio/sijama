<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:55:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppPollResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $myVote = $this->resource->getAttribute('my_vote');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'is_active' => (bool) $this->is_active,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'created_by' => $this->created_by,
            'votes_count' => $this->when(isset($this->votes_count), (int) $this->votes_count),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'options' => $this->whenLoaded('options', fn () => $this->options->map(fn ($option) => [
                'id' => $option->id,
                'poll_id' => $option->poll_id,
                'label' => $option->label,
                'urutan' => $option->urutan,
                'votes_count' => isset($option->votes_count) ? (int) $option->votes_count : null,
            ])->values()),
            'my_vote' => $myVote ? [
                'id' => $myVote->id,
                'poll_id' => $myVote->poll_id,
                'option_id' => $myVote->option_id,
                'created_at' => $myVote->created_at?->toIso8601String(),
            ] : null,
            'creator' => $this->whenLoaded('creator', fn () => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'username' => $this->creator->username,
            ] : null),
        ];
    }
}
