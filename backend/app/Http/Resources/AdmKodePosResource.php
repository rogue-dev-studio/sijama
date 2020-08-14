<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:24:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:24:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmKodePosResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode' => $this->kode,
            'desa_kelurahan_id' => $this->desa_kelurahan_id,
            'desa_kelurahan' => $this->whenLoaded('desaKelurahan', fn () => $this->desaKelurahan ? [
                'id' => $this->desaKelurahan->id,
                'kode' => $this->desaKelurahan->kode,
                'nama' => $this->desaKelurahan->nama,
            ] : null),
            'kecamatan_id' => $this->kecamatan_id,
            'kecamatan' => $this->whenLoaded('kecamatan', fn () => $this->kecamatan ? [
                'id' => $this->kecamatan->id,
                'kode' => $this->kecamatan->kode,
                'nama' => $this->kecamatan->nama,
            ] : null),
            'nama_wilayah' => $this->nama_wilayah,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
