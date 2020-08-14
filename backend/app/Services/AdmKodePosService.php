<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:38:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:38:00
 */

namespace App\Services;

use App\Http\Resources\AdmKodePosResource;
use App\Models\AdmDesaKelurahan;
use App\Models\AdmKecamatan;
use App\Models\AdmKodePos;
use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AdmKodePosService
{
    public function list(
        ?string $query = null,
        ?int $desaKelurahanId = null,
        ?int $kecamatanId = null,
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $builder = AdmKodePos::query()->with(['desaKelurahan', 'kecamatan'])->orderBy('kode');

        if ($desaKelurahanId !== null) {
            $builder->where('desa_kelurahan_id', $desaKelurahanId);
        }

        if ($kecamatanId !== null) {
            $builder->where('kecamatan_id', $kecamatanId);
        }

        if ($query) {
            $builder->where('kode', 'like', "%{$query}%");
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): AdmKodePosResource
    {
        if (! empty($data['desa_kelurahan_id'])) {
            AdmDesaKelurahan::findOrFail($data['desa_kelurahan_id']);
        }

        if (! empty($data['kecamatan_id'])) {
            AdmKecamatan::findOrFail($data['kecamatan_id']);
        }

        $kodePos = AdmKodePos::create($data);

        return new AdmKodePosResource($kodePos->load(['desaKelurahan', 'kecamatan']));
    }

    public function find(int $id): AdmKodePosResource
    {
        return new AdmKodePosResource($this->findModel($id)->load(['desaKelurahan', 'kecamatan']));
    }

    public function update(int $id, array $data): AdmKodePosResource
    {
        $kodePos = $this->findModel($id);

        if (! empty($data['desa_kelurahan_id'])) {
            AdmDesaKelurahan::findOrFail($data['desa_kelurahan_id']);
        }

        if (! empty($data['kecamatan_id'])) {
            AdmKecamatan::findOrFail($data['kecamatan_id']);
        }

        $kodePos->update($data);

        return new AdmKodePosResource($kodePos->fresh()->load(['desaKelurahan', 'kecamatan']));
    }

    public function delete(int $id): void
    {
        $this->findModel($id)->delete();
    }

    private function findModel(int $id): AdmKodePos
    {
        $kodePos = AdmKodePos::find($id);

        if (! $kodePos) {
            throw new ModelNotFoundException('Kode pos tidak ditemukan.');
        }

        return $kodePos;
    }
}
