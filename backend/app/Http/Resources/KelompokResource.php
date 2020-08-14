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
            'desa_id' => $this->desa_id,
            'desa' => $this->whenLoaded('desa', fn () => [
                'id' => $this->desa->id,
                'kode' => $this->desa->kode,
                'nama' => $this->desa->nama,
                'daerah_id' => $this->desa->daerah_id,
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
