<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:36:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:36:00
 */

namespace App\Services;

use App\Http\Resources\AdmKabupatenKotaResource;
use App\Models\AdmKabupatenKota;
use App\Models\AdmProvinsi;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class AdmKabupatenKotaService
{
    public function list(
        ?string $query = null,
        ?int $provinsiId = null,
        ?string $jenis = null,
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $builder = AdmKabupatenKota::query()->with('provinsi')->orderBy('nama');

        if ($provinsiId !== null) {
            $builder->where('provinsi_id', $provinsiId);
        }

        if ($jenis) {
            $builder->where('jenis', $jenis);
        }

        if ($query) {
            SearchHelper::likeGroup($builder, ['nama', 'kode'], $query);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): AdmKabupatenKotaResource
    {
        AdmProvinsi::findOrFail($data['provinsi_id']);

        $kabupatenKota = AdmKabupatenKota::create($data);

        return new AdmKabupatenKotaResource($kabupatenKota->load('provinsi'));
    }

    public function find(int $id): AdmKabupatenKotaResource
    {
        return new AdmKabupatenKotaResource($this->findModel($id)->load('provinsi'));
    }

    public function update(int $id, array $data): AdmKabupatenKotaResource
    {
        $kabupatenKota = $this->findModel($id);

        if (isset($data['provinsi_id'])) {
            AdmProvinsi::findOrFail($data['provinsi_id']);
        }

        $kabupatenKota->update($data);

        return new AdmKabupatenKotaResource($kabupatenKota->fresh()->load('provinsi'));
    }

    public function delete(int $id): void
    {
        $kabupatenKota = $this->findModel($id);

        if ($kabupatenKota->kecamatan()->exists()) {
            throw ValidationException::withMessages([
                'adm_kabupaten_kota' => ['Kabupaten/kota masih memiliki kecamatan terkait.'],
            ]);
        }

        $kabupatenKota->delete();
    }

    private function findModel(int $id): AdmKabupatenKota
    {
        $kabupatenKota = AdmKabupatenKota::find($id);

        if (! $kabupatenKota) {
            throw new ModelNotFoundException('Kabupaten/kota tidak ditemukan.');
        }

        return $kabupatenKota;
    }
}
