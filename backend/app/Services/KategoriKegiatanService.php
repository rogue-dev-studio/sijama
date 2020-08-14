<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

namespace App\Services;

use App\Http\Resources\KategoriKegiatanResource;
use App\Models\KategoriKegiatan;

class KategoriKegiatanService extends SimpleMasterService
{
    protected function modelClass(): string
    {
        return KategoriKegiatan::class;
    }

    protected function resourceClass(): string
    {
        return KategoriKegiatanResource::class;
    }

    protected function searchable(): array
    {
        return ['nama', 'kode'];
    }

    protected function assertDeletable($model): void
    {
        $this->denyDeleteIfRelated($model, 'kegiatan', 'Kategori masih dipakai kegiatan.');
        $this->denyDeleteIfRelated($model, 'pengajian', 'Kategori masih dipakai pengajian.');
    }
}
