<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DapukanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode' => $this->kode,
            'nama' => $this->nama,
            'deskripsi' => $this->deskripsi,
            'tingkat' => $this->tingkat,
            'urutan' => $this->urutan,
            'is_system' => $this->is_system,
            'is_active' => $this->is_active,
            'hak_akses_ids' => $this->whenLoaded('hakAkses', fn () => $this->hakAkses->pluck('id')->values()),
            'hak_akses' => HakAksesResource::collection($this->whenLoaded('hakAkses')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
