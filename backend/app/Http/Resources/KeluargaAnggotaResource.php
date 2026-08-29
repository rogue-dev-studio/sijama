<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KeluargaAnggotaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'jamaah_id' => $this->id,
            'hubungan_keluarga' => $this->pivot?->hubungan_keluarga,
            'hubungan_keluarga_label' => $this->hubungan_keluarga_label ?? null,
            'is_kepala_keluarga' => (bool) ($this->pivot?->is_kepala_keluarga ?? false),
            'catatan' => $this->pivot?->catatan,
            'jamaah' => [
                'id' => $this->id,
                'nama' => $this->nama,
                'nik' => $this->nik,
                'gender' => $this->gender,
                'tanggal_lahir' => $this->tanggal_lahir?->format('Y-m-d'),
                'no_hp' => $this->no_hp,
            ],
        ];
    }
}
