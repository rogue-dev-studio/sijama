<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

namespace App\Services;

use App\Http\Resources\MateriResource;
use App\Models\Materi;

class MateriService extends SimpleMasterService
{
    protected function modelClass(): string
    {
        return Materi::class;
    }

    protected function resourceClass(): string
    {
        return MateriResource::class;
    }

    protected function searchable(): array
    {
        return ['nama'];
    }

    protected function assertDeletable($model): void
    {
        $this->denyDeleteIfRelated($model, 'pengajian', 'Materi masih dipakai pengajian.');
    }
}
