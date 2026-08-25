<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:06:41
 */

namespace App\Services;

use App\Http\Resources\PemateriResource;
use App\Models\Jamaah;
use App\Models\Pemateri;
use Illuminate\Validation\ValidationException;

class PemateriService extends SimpleMasterService
{
    protected function modelClass(): string
    {
        return Pemateri::class;
    }

    protected function resourceClass(): string
    {
        return PemateriResource::class;
    }

    protected function searchable(): array
    {
        return ['nama', 'kontak'];
    }

    protected function withRelations(): array
    {
        return ['jamaah:id,nama,no_hp,email'];
    }

    protected function prepare(array $data): array
    {
        if (empty($data['jamaah_id'])) {
            return $data;
        }

        $jamaah = Jamaah::query()->find($data['jamaah_id']);
        if (! $jamaah) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Jamaah tidak ditemukan.'],
            ]);
        }

        $data['nama'] = $jamaah->nama;
        $data['kontak'] = $jamaah->no_hp ?: $jamaah->email;

        return $data;
    }

    protected function assertDeletable($model): void
    {
        $this->denyDeleteIfRelated($model, 'pengajian', 'Pemateri masih dipakai pengajian.');
    }
}
