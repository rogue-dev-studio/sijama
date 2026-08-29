<?php

namespace App\Services;

use App\Http\Resources\DapukanResource;
use App\Http\Resources\HakAksesResource;
use App\Models\Dapukan;
use App\Models\HakAkses;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class MatriksService
{
    public function show(): array
    {
        $dapukan = Dapukan::query()->orderBy('urutan')->with('hakAkses')->get();
        $hakAkses = HakAkses::query()
            ->with(['fitur.menu.parent.parent'])
            ->orderBy('slug')
            ->get();

        return [
            'dapukan' => DapukanResource::collection($dapukan)->resolve(),
            'hak_akses' => HakAksesResource::collection($hakAkses)->resolve(),
        ];
    }

    public function update(int $dapukanId, array $hakAksesIds): DapukanResource
    {
        $dapukan = Dapukan::with('hakAkses')->find($dapukanId);

        if (! $dapukan) {
            throw new ModelNotFoundException('Dapukan tidak ditemukan.');
        }

        $validIds = HakAkses::query()->whereIn('id', $hakAksesIds)->pluck('id')->all();

        if (count($validIds) !== count(array_unique($hakAksesIds))) {
            throw ValidationException::withMessages([
                'hak_akses_ids' => ['Terdapat hak akses yang tidak valid.'],
            ]);
        }

        // Exact sync — matriks is the source of truth (no forced grants for any dapukan).
        $dapukan->hakAkses()->sync(array_values(array_unique($validIds)));

        return new DapukanResource($dapukan->fresh()->load('hakAkses'));
    }
}
