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
            'wilayah_adm_negara_id' => $this->wilayah_adm_negara_id,
            'wilayah_adm_negara' => $this->whenLoaded('wilayahAdmNegara', fn () => [
                'id' => $this->wilayahAdmNegara->id,
                'kode' => $this->wilayahAdmNegara->kode,
                'nama' => $this->wilayahAdmNegara->nama,
            ]),
            'kode' => $this->kode,
            'nama' => $this->nama,
            'singkatan' => $this->singkatan,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
