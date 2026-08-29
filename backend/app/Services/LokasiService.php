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
            'admDesaKelurahan.kecamatan.kabupatenKota.provinsi',
        ];
    }

    protected function prepare(array $data): array
    {
        if (! empty($data['adm_desa_kelurahan_id'])) {
            $desa = AdmDesaKelurahan::query()
                ->with('kecamatan.kabupatenKota')
                ->find($data['adm_desa_kelurahan_id']);

            if ($desa?->kecamatan?->kabupatenKota) {
                $data['kota'] = $desa->kecamatan->kabupatenKota->nama;
            }
        }

        return $data;
    }

    protected function assertDeletable($model): void
    {
        $this->denyDeleteIfRelated($model, 'pengajian', 'Lokasi masih dipakai pengajian.');
        $this->denyDeleteIfRelated($model, 'kegiatan', 'Lokasi masih dipakai kegiatan.');
    }
}
