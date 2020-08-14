<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:22:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:22:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmKabupatenKotaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'provinsi_id' => $this->provinsi_id,
            'provinsi' => $this->whenLoaded('provinsi', fn () => [
                'id' => $this->provinsi->id,
                'kode' => $this->provinsi->kode,
                'nama' => $this->provinsi->nama,
            ]),
            'kode' => $this->kode,
            'nama' => $this->nama,
            'jenis' => $this->jenis,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
