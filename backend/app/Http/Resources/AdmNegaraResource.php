<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:25:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:25:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmNegaraResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode' => $this->kode,
            'nama' => $this->nama,
            'iso3' => $this->iso3,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
