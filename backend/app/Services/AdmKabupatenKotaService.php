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
use App\Support\SortHelper;
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
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = AdmKabupatenKota::query()->with('wilayahAdmProvinsi');
        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['nama', 'kode', 'jenis', 'is_active'],
            'nama',
        );

        if ($provinsiId !== null) {
            $builder->where('wilayah_adm_provinsi_id', $provinsiId);
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
        AdmProvinsi::findOrFail($data['wilayah_adm_provinsi_id']);

        $wilayahAdmKabupatenKota = AdmKabupatenKota::create($data);

        return new AdmKabupatenKotaResource($wilayahAdmKabupatenKota->load('wilayahAdmProvinsi'));
    }

    public function find(int $id): AdmKabupatenKotaResource
    {
        return new AdmKabupatenKotaResource($this->findModel($id)->load('wilayahAdmProvinsi'));
    }

    public function update(int $id, array $data): AdmKabupatenKotaResource
    {
        $wilayahAdmKabupatenKota = $this->findModel($id);

        if (isset($data['wilayah_adm_provinsi_id'])) {
            AdmProvinsi::findOrFail($data['wilayah_adm_provinsi_id']);
        }

        $wilayahAdmKabupatenKota->update($data);

        return new AdmKabupatenKotaResource($wilayahAdmKabupatenKota->fresh()->load('wilayahAdmProvinsi'));
    }

    public function delete(int $id): void
    {
        $wilayahAdmKabupatenKota = $this->findModel($id);

        if ($wilayahAdmKabupatenKota->wilayahAdmKecamatan()->exists()) {
            throw ValidationException::withMessages([
                'wilayah_adm_kabupaten_kota' => ['Kabupaten/kota masih memiliki kecamatan terkait.'],
            ]);
        }

        $wilayahAdmKabupatenKota->delete();
    }

    private function findModel(int $id): AdmKabupatenKota
    {
        $wilayahAdmKabupatenKota = AdmKabupatenKota::find($id);

        if (! $wilayahAdmKabupatenKota) {
            throw new ModelNotFoundException('Kabupaten/kota tidak ditemukan.');
        }

        return $wilayahAdmKabupatenKota;
    }
}
