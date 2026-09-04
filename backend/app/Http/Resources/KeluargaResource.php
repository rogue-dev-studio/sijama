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

class KeluargaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'wilayah_fung_kelompok_id' => $this->wilayah_fung_kelompok_id,
            'wilayah_fung_kelompok' => $this->whenLoaded('wilayahFungKelompok', fn () => $this->wilayahFungKelompok ? [
                'id' => $this->wilayahFungKelompok->id,
                'kode' => $this->wilayahFungKelompok->kode,
                'nama' => $this->wilayahFungKelompok->nama,
            ] : null),
            'kepala_jamaah_id' => $this->kepala_jamaah_id,
            'kepala_jamaah' => $this->whenLoaded('kepalaJamaah', fn () => $this->kepalaJamaah ? [
                'id' => $this->kepalaJamaah->id,
                'nama' => $this->kepalaJamaah->nama,
                'nik' => $this->kepalaJamaah->nik,
                'no_hp' => $this->kepalaJamaah->no_hp,
            ] : null),
            'no_kk' => $this->no_kk,
            'alamat' => $this->alamat,
            'rt' => $this->rt,
            'rw' => $this->rw,
            'wilayah_adm_desa_id' => $this->wilayah_adm_desa_id,
            'wilayah_adm_desa' => $this->whenLoaded('wilayahAdmDesa', fn () => $this->wilayahAdmDesa ? [
                'id' => $this->wilayahAdmDesa->id,
                'kode' => $this->wilayahAdmDesa->kode,
                'nama' => $this->wilayahAdmDesa->nama,
            ] : null),
            'kode_pos' => $this->kode_pos,
            'catatan' => $this->catatan,
            'status' => $this->status,
            'anggota_count' => $this->whenCounted('anggota'),
            'anggota' => KeluargaAnggotaResource::collection($this->whenLoaded('anggota')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
