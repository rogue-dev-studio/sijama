<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KelompokResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'wilayah_fung_desa_id' => $this->wilayah_fung_desa_id,
            'wilayah_fung_desa' => $this->whenLoaded('wilayahFungDesa', fn () => [
                'id' => $this->wilayahFungDesa->id,
                'kode' => $this->wilayahFungDesa->kode,
                'nama' => $this->wilayahFungDesa->nama,
                'wilayah_fung_daerah_id' => $this->wilayahFungDesa->wilayah_fung_daerah_id,
            ]),
            'kode' => $this->kode,
            'nama' => $this->nama,
            'singkatan' => $this->singkatan,
            'deskripsi' => $this->deskripsi,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
