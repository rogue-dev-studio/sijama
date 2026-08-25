<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HakAksesResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fitur_id' => $this->fitur_id,
            'slug' => $this->slug,
            'nama' => $this->nama,
            'aksi' => $this->aksi,
            'fitur' => new FiturResource($this->whenLoaded('fitur')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
