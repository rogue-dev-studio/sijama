<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'session_id' => $this->session_id,
            'jamaah_id' => $this->jamaah_id,
            'method' => $this->method,
            'matched_distance' => $this->matched_distance,
            'recorded_by' => $this->recorded_by,
            'recorded_at' => $this->recorded_at?->toIso8601String(),
            'jamaah' => new JamaahResource($this->whenLoaded('jamaah')),
        ];
    }
}
