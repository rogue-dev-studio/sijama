<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:06:41
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LokasiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $desa = $this->relationLoaded('admDesaKelurahan') ? $this->admDesaKelurahan : null;
        $kecamatan = $desa?->kecamatan;
        $kabupaten = $kecamatan?->kabupatenKota;
        $provinsi = $kabupaten?->provinsi;

        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'jenis' => $this->jenis,
            'kota' => $this->kota,
            'adm_desa_kelurahan_id' => $this->adm_desa_kelurahan_id,
            'adm_desa_kelurahan' => $desa ? [
                'id' => $desa->id,
                'kode' => $desa->kode,
                'nama' => $desa->nama,
            ] : null,
            'adm_kecamatan' => $kecamatan ? [
                'id' => $kecamatan->id,
                'kode' => $kecamatan->kode,
                'nama' => $kecamatan->nama,
            ] : null,
            'adm_kabupaten_kota' => $kabupaten ? [
                'id' => $kabupaten->id,
                'kode' => $kabupaten->kode,
                'nama' => $kabupaten->nama,
            ] : null,
            'adm_provinsi' => $provinsi ? [
                'id' => $provinsi->id,
                'kode' => $provinsi->kode,
                'nama' => $provinsi->nama,
            ] : null,
            'alamat' => $this->alamat,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'deskripsi' => $this->deskripsi,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
