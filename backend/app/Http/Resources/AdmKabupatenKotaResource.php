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
            'wilayah_adm_provinsi_id' => $this->wilayah_adm_provinsi_id,
            'wilayah_adm_provinsi' => $this->whenLoaded('wilayahAdmProvinsi', fn () => [
                'id' => $this->wilayahAdmProvinsi->id,
                'kode' => $this->wilayahAdmProvinsi->kode,
                'nama' => $this->wilayahAdmProvinsi->nama,
                'singkatan' => $this->wilayahAdmProvinsi->singkatan,
            ]),
            'kode' => $this->kode,
            'nama' => $this->nama,
            'jenis' => $this->jenis,
            'singkatan' => $this->singkatan,
            'singkatan_kawasan_metropolitan' => $this->singkatan_kawasan_metropolitan,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
