<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:37:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:37:00
 */

namespace App\Services;

use App\Http\Resources\AdmKecamatanResource;
use App\Models\AdmKabupatenKota;
use App\Models\AdmKecamatan;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class AdmKecamatanService
{
    public function list(
        ?string $query = null,
        ?int $kabupatenKotaId = null,
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $builder = AdmKecamatan::query()->with('kabupatenKota')->orderBy('nama');

        if ($kabupatenKotaId !== null) {
            $builder->where('kabupaten_kota_id', $kabupatenKotaId);
        }

        if ($query) {
            SearchHelper::likeGroup($builder, ['nama', 'kode'], $query);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): AdmKecamatanResource
    {
        AdmKabupatenKota::findOrFail($data['kabupaten_kota_id']);

        $kecamatan = AdmKecamatan::create($data);

        return new AdmKecamatanResource($kecamatan->load('kabupatenKota'));
    }

    public function find(int $id): AdmKecamatanResource
    {
        return new AdmKecamatanResource($this->findModel($id)->load('kabupatenKota'));
    }

    public function update(int $id, array $data): AdmKecamatanResource
    {
        $kecamatan = $this->findModel($id);

        if (isset($data['kabupaten_kota_id'])) {
            AdmKabupatenKota::findOrFail($data['kabupaten_kota_id']);
        }

        $kecamatan->update($data);

        return new AdmKecamatanResource($kecamatan->fresh()->load('kabupatenKota'));
    }

    public function delete(int $id): void
    {
        $kecamatan = $this->findModel($id);

        if ($kecamatan->desaKelurahan()->exists()) {
            throw ValidationException::withMessages([
                'adm_kecamatan' => ['Kecamatan masih memiliki desa/kelurahan terkait.'],
            ]);
        }

        if ($kecamatan->kodePos()->exists()) {
            throw ValidationException::withMessages([
                'adm_kecamatan' => ['Kecamatan masih memiliki kode pos terkait.'],
            ]);
        }

        $kecamatan->delete();
    }

    private function findModel(int $id): AdmKecamatan
    {
        $kecamatan = AdmKecamatan::find($id);

        if (! $kecamatan) {
            throw new ModelNotFoundException('Kecamatan tidak ditemukan.');
        }

        return $kecamatan;
    }
}
