<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:21:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:21:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmDesaKelurahanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kecamatan_id' => $this->kecamatan_id,
            'kecamatan' => $this->whenLoaded('kecamatan', fn () => [
                'id' => $this->kecamatan->id,
                'kode' => $this->kecamatan->kode,
                'nama' => $this->kecamatan->nama,
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
