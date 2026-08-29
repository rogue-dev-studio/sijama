<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:24:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:15:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmKodePosResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $desa = $this->relationLoaded('desaKelurahan') ? $this->desaKelurahan : null;
        $kecamatan = $desa?->relationLoaded('kecamatan') ? $desa->kecamatan : null;
        $kabupaten = $kecamatan?->relationLoaded('kabupatenKota') ? $kecamatan->kabupatenKota : null;
        $provinsi = $kabupaten?->relationLoaded('provinsi') ? $kabupaten->provinsi : null;
        $negara = $provinsi?->relationLoaded('negara') ? $provinsi->negara : null;

        return [
            'id' => $this->id,
            'kode' => $this->kode,
            'desa_kelurahan_id' => $this->desa_kelurahan_id,
            'desa_kelurahan' => $desa ? [
                'id' => $desa->id,
                'kode' => $desa->kode,
                'nama' => $desa->nama,
            ] : null,
            'kecamatan_id' => $this->kecamatan_id,
            'kecamatan' => $kecamatan ? [
                'id' => $kecamatan->id,
                'kode' => $kecamatan->kode,
                'nama' => $kecamatan->nama,
            ] : null,
            'wilayah' => ($desa || $kecamatan || $kabupaten || $provinsi || $negara) ? [
                'negara' => $negara?->nama,
                'provinsi' => $provinsi?->nama,
                'kabupaten_kota' => $kabupaten?->nama,
                'kecamatan' => $kecamatan?->nama,
                'desa_kelurahan' => $desa?->nama,
            ] : null,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
