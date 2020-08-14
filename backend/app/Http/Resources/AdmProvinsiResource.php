<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:26:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:26:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmProvinsiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'negara_id' => $this->negara_id,
            'negara' => $this->whenLoaded('negara', fn () => [
                'id' => $this->negara->id,
                'kode' => $this->negara->kode,
                'nama' => $this->negara->nama,
            ]),
            'kode' => $this->kode,
            'nama' => $this->nama,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
