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
            'kelompok_id' => $this->kelompok_id,
            'kelompok' => $this->whenLoaded('kelompok', fn () => [
                'id' => $this->kelompok->id,
                'kode' => $this->kelompok->kode,
                'nama' => $this->kelompok->nama,
                'desa_id' => $this->kelompok->desa_id,
            ]),
            'kode' => $this->kode,
            'nama' => $this->nama,
            'deskripsi' => $this->deskripsi,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
