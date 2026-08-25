<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:06:41
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PemateriResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'jamaah_id' => $this->jamaah_id,
            'jamaah' => $this->whenLoaded('jamaah', fn () => $this->jamaah ? [
                'id' => $this->jamaah->id,
                'nama' => $this->jamaah->nama,
                'no_hp' => $this->jamaah->no_hp,
                'email' => $this->jamaah->email,
            ] : null),
            'nama' => $this->nama,
            'kontak' => $this->kontak,
            'deskripsi' => $this->deskripsi,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
