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
            ->where('slug', 'not like', 'konfig.%')
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

        $konfigIds = HakAkses::query()
            ->where('slug', 'like', 'konfig.%')
            ->pluck('id')
            ->all();

        if ($dapukan->slug === 'superadmin') {
            $validIds = array_values(array_unique(array_merge($validIds, $konfigIds)));
        } else {
            $validIds = array_values(array_diff($validIds, $konfigIds));
        }

        $dapukan->hakAkses()->sync($validIds);

        return new DapukanResource($dapukan->fresh()->load('hakAkses'));
    }
}
