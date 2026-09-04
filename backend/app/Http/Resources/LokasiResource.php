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
        $desa = $this->relationLoaded('wilayahAdmDesa') ? $this->wilayahAdmDesa : null;
        $kecamatan = $desa?->wilayahAdmKecamatan;
        $kabupaten = $kecamatan?->wilayahAdmKabupatenKota;
        $provinsi = $kabupaten?->wilayahAdmProvinsi;

        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'jenis' => $this->jenis,
            'kota' => $this->kota,
            'wilayah_adm_desa_id' => $this->wilayah_adm_desa_id,
            'wilayah_adm_desa' => $desa ? [
                'id' => $desa->id,
                'kode' => $desa->kode,
                'nama' => $desa->nama,
            ] : null,
            'wilayah_adm_kecamatan' => $kecamatan ? [
                'id' => $kecamatan->id,
                'kode' => $kecamatan->kode,
                'nama' => $kecamatan->nama,
            ] : null,
            'wilayah_adm_kabupaten_kota' => $kabupaten ? [
                'id' => $kabupaten->id,
                'kode' => $kabupaten->kode,
                'nama' => $kabupaten->nama,
            ] : null,
            'wilayah_adm_provinsi' => $provinsi ? [
                'id' => $provinsi->id,
                'kode' => $provinsi->kode,
                'nama' => $provinsi->nama,
            ] : null,
            'alamat' => $this->alamat,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'maps_place_id' => $this->maps_place_id,
            'maps_place_name' => $this->maps_place_name,
            'maps_url' => $this->maps_url,
            'deskripsi' => $this->deskripsi,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
