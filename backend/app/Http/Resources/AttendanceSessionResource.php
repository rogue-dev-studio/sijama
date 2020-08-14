<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'ref_id' => $this->ref_id,
            'title' => $this->title,
            'opened_by' => $this->opened_by,
            'opened_at' => $this->opened_at?->toIso8601String(),
            'closed_at' => $this->closed_at?->toIso8601String(),
            'status' => $this->status,
            'attendance_count' => $this->when(isset($this->attendances_count), $this->attendances_count),
            'attendances' => AttendanceResource::collection($this->whenLoaded('attendances')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
