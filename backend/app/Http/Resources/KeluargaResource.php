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
            'kelompok_id' => $this->kelompok_id,
            'kelompok' => $this->whenLoaded('kelompok', fn () => $this->kelompok ? [
                'id' => $this->kelompok->id,
                'kode' => $this->kelompok->kode,
                'nama' => $this->kelompok->nama,
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
            'adm_desa_kelurahan_id' => $this->adm_desa_kelurahan_id,
            'adm_desa_kelurahan' => $this->whenLoaded('admDesaKelurahan', fn () => $this->admDesaKelurahan ? [
                'id' => $this->admDesaKelurahan->id,
                'kode' => $this->admDesaKelurahan->kode,
                'nama' => $this->admDesaKelurahan->nama,
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
