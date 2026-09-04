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
        $desa = $this->relationLoaded('wilayahAdmDesa') ? $this->wilayahAdmDesa : null;
        $kecamatan = $desa?->relationLoaded('wilayahAdmKecamatan') ? $desa->wilayahAdmKecamatan : null;
        $kabupaten = $kecamatan?->relationLoaded('wilayahAdmKabupatenKota') ? $kecamatan->wilayahAdmKabupatenKota : null;
        $provinsi = $kabupaten?->relationLoaded('wilayahAdmProvinsi') ? $kabupaten->wilayahAdmProvinsi : null;
        $negara = $provinsi?->relationLoaded('wilayahAdmNegara') ? $provinsi->wilayahAdmNegara : null;

        return [
            'id' => $this->id,
            'kode' => $this->kode,
            'wilayah_adm_desa_id' => $this->wilayah_adm_desa_id,
            'wilayah_adm_desa' => $desa ? [
                'id' => $desa->id,
                'kode' => $desa->kode,
                'nama' => $desa->nama,
            ] : null,
            'wilayah_adm_kecamatan_id' => $this->wilayah_adm_kecamatan_id,
            'wilayah_adm_kecamatan' => $kecamatan ? [
                'id' => $kecamatan->id,
                'kode' => $kecamatan->kode,
                'nama' => $kecamatan->nama,
            ] : null,
            'wilayah' => ($desa || $kecamatan || $kabupaten || $provinsi || $negara) ? [
                'wilayah_adm_negara' => $negara?->nama,
                'wilayah_adm_provinsi' => $provinsi?->nama,
                'wilayah_adm_kabupaten_kota' => $kabupaten?->nama,
                'wilayah_adm_kecamatan' => $kecamatan?->nama,
                'wilayah_adm_desa' => $desa?->nama,
            ] : null,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
