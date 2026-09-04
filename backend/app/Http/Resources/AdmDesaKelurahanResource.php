<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:21:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:21:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmDesaKelurahanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'wilayah_adm_kecamatan_id' => $this->wilayah_adm_kecamatan_id,
            'wilayah_adm_kecamatan' => $this->whenLoaded('wilayahAdmKecamatan', fn () => [
                'id' => $this->wilayahAdmKecamatan->id,
                'kode' => $this->wilayahAdmKecamatan->kode,
                'nama' => $this->wilayahAdmKecamatan->nama,
            ]),
            'kode' => $this->kode,
            'nama' => $this->nama,
            'jenis' => $this->jenis,
            'kode_pos' => $this->when(
                $this->relationLoaded('kodePos'),
                fn () => $this->kodePos
                    ->sortBy('kode')
                    ->first(fn ($item) => (bool) $item->is_active)
                    ?->kode
                    ?? $this->kodePos->sortBy('kode')->first()?->kode,
            ),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
