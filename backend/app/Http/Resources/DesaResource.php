<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DesaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'wilayah_fung_daerah_id' => $this->wilayah_fung_daerah_id,
            'wilayah_fung_daerah' => $this->whenLoaded('wilayahFungDaerah', fn () => [
                'id' => $this->wilayahFungDaerah->id,
                'kode' => $this->wilayahFungDaerah->kode,
                'nama' => $this->wilayahFungDaerah->nama,
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
