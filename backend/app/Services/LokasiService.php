<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:06:41
 */

namespace App\Services;

use App\Http\Resources\LokasiResource;
use App\Models\AdmDesaKelurahan;
use App\Models\Lokasi;

class LokasiService extends SimpleMasterService
{
    protected function modelClass(): string
    {
        return Lokasi::class;
    }

    protected function resourceClass(): string
    {
        return LokasiResource::class;
    }

    protected function searchable(): array
    {
        return ['nama', 'kota', 'alamat'];
    }

    protected function sortableColumns(): array
    {
        return ['jenis', 'nama', 'is_active'];
    }

    protected function withRelations(): array
    {
        return [
            'wilayahAdmDesa.wilayahAdmKecamatan.wilayahAdmKabupatenKota.wilayahAdmProvinsi',
        ];
    }

    protected function prepare(array $data): array
    {
        if (! empty($data['wilayah_adm_desa_id'])) {
            $desa = AdmDesaKelurahan::query()
                ->with('wilayahAdmKecamatan.wilayahAdmKabupatenKota')
                ->find($data['wilayah_adm_desa_id']);

            if ($desa?->wilayahAdmKecamatan?->wilayahAdmKabupatenKota) {
                $data['kota'] = $desa->wilayahAdmKecamatan->wilayahAdmKabupatenKota->nama;
            }
        }

        return $data;
    }

    protected function assertDeletable($model): void
    {
        $this->denyDeleteIfRelated($model, 'kegiatan', 'Lokasi masih dipakai kegiatan.');
    }
}
