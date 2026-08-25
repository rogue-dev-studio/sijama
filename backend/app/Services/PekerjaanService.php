<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:06:41
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:06:41
 */

namespace App\Services;

use App\Http\Resources\PekerjaanResource;
use App\Models\Jamaah;
use App\Models\Pekerjaan;

class PekerjaanService extends SimpleMasterService
{
    protected function modelClass(): string
    {
        return Pekerjaan::class;
    }

    protected function resourceClass(): string
    {
        return PekerjaanResource::class;
    }

    protected function searchable(): array
    {
        return ['nama'];
    }

    protected function assertDeletable($model): void
    {
        if (Jamaah::query()->where('pekerjaan_id', $model->id)->exists()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'id' => ['Pekerjaan masih dipakai jamaah.'],
            ]);
        }
    }
}
