<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubKelompokResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'wilayah_fung_kelompok_id' => $this->wilayah_fung_kelompok_id,
            'wilayah_fung_kelompok' => $this->whenLoaded('wilayahFungKelompok', fn () => [
                'id' => $this->wilayahFungKelompok->id,
                'kode' => $this->wilayahFungKelompok->kode,
                'nama' => $this->wilayahFungKelompok->nama,
                'wilayah_fung_desa_id' => $this->wilayahFungKelompok->wilayah_fung_desa_id,
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
