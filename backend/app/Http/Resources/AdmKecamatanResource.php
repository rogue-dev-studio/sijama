<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:23:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:23:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmKecamatanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kabupaten_kota_id' => $this->kabupaten_kota_id,
            'kabupaten_kota' => $this->whenLoaded('kabupatenKota', fn () => [
                'id' => $this->kabupatenKota->id,
                'kode' => $this->kabupatenKota->kode,
                'nama' => $this->kabupatenKota->nama,
            ]),
            'kode' => $this->kode,
            'nama' => $this->nama,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
