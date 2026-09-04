<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DaerahResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'wilayah_fung_pusat_id' => $this->wilayah_fung_pusat_id,
            'wilayah_fung_pusat' => $this->whenLoaded('wilayahFungPusat', fn () => [
                'id' => $this->wilayahFungPusat->id,
                'kode' => $this->wilayahFungPusat->kode,
                'nama' => $this->wilayahFungPusat->nama,
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
