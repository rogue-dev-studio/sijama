<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 14:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 14:05:00
 */

namespace App\Support;

use App\Models\AdmKecamatan;

class NikWilayahResolver
{
    /**
     * Digit 1–6 NIK = kode Kemendagri kecamatan (XX.XX.XX).
     */
    public static function kecamatanKodeFromNik(?string $nik): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $nik) ?? '';
        if (strlen($digits) < 6) {
            return null;
        }

        $six = substr($digits, 0, 6);
        if ($six === '000000' || str_starts_with($six, '00')) {
            return null;
        }

        return substr($six, 0, 2).'.'.substr($six, 2, 2).'.'.substr($six, 4, 2);
    }

    /**
     * @return array<string, mixed>
     */
    public function resolve(?string $nik): array
    {
        $kecamatanKode = self::kecamatanKodeFromNik($nik);
        if ($kecamatanKode === null) {
            return ['found' => false, 'kecamatan_kode' => null];
        }

        $kecamatan = AdmKecamatan::query()
            ->where('kode', $kecamatanKode)
            ->where('is_active', true)
            ->with([
                'wilayahAdmKabupatenKota.wilayahAdmProvinsi.wilayahAdmNegara',
            ])
            ->first();

        if (! $kecamatan || ! $kecamatan->wilayahAdmKabupatenKota || ! $kecamatan->wilayahAdmKabupatenKota->wilayahAdmProvinsi) {
            return [
                'found' => false,
                'kecamatan_kode' => $kecamatanKode,
            ];
        }

        $kabupaten = $kecamatan->wilayahAdmKabupatenKota;
        $provinsi = $kabupaten->wilayahAdmProvinsi;
        $negara = $provinsi->wilayahAdmNegara;

        return [
            'found' => true,
            'kecamatan_kode' => $kecamatanKode,
            'wilayah_adm_negara_id' => $negara?->id,
            'wilayah_adm_provinsi_id' => $provinsi->id,
            'wilayah_adm_kabupaten_kota_id' => $kabupaten->id,
            'wilayah_adm_kecamatan_id' => $kecamatan->id,
            'wilayah_adm_negara' => $negara ? [
                'id' => $negara->id,
                'kode' => $negara->kode,
                'nama' => $negara->nama,
            ] : null,
            'wilayah_adm_provinsi' => [
                'id' => $provinsi->id,
                'kode' => $provinsi->kode,
                'nama' => $provinsi->nama,
            ],
            'wilayah_adm_kabupaten_kota' => [
                'id' => $kabupaten->id,
                'kode' => $kabupaten->kode,
                'nama' => $kabupaten->nama,
                'jenis' => $kabupaten->jenis,
            ],
            'wilayah_adm_kecamatan' => [
                'id' => $kecamatan->id,
                'kode' => $kecamatan->kode,
                'nama' => $kecamatan->nama,
            ],
        ];
    }
}
