<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:35:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:35:00
 */

namespace App\Services;

use App\Http\Resources\AdmDesaKelurahanResource;
use App\Models\AdmDesaKelurahan;
use App\Models\AdmKecamatan;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class AdmDesaKelurahanService
{
    public function list(
        ?string $query = null,
        ?int $kecamatanId = null,
        ?string $jenis = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = AdmDesaKelurahan::query()->with([
            'wilayahAdmKecamatan',
            'kodePos' => fn ($query) => $query->orderBy('kode'),
        ]);
        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['nama', 'kode', 'jenis', 'is_active'],
            'nama',
        );

        if ($kecamatanId !== null) {
            $builder->where('wilayah_adm_kecamatan_id', $kecamatanId);
        }

        if ($jenis) {
            $builder->where('jenis', $jenis);
        }

        if ($query) {
            SearchHelper::likeGroup($builder, ['nama', 'kode'], $query);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): AdmDesaKelurahanResource
    {
        AdmKecamatan::findOrFail($data['wilayah_adm_kecamatan_id']);

        $wilayahAdmDesa = AdmDesaKelurahan::create($data);

        return new AdmDesaKelurahanResource($wilayahAdmDesa->load(['wilayahAdmKecamatan', 'kodePos']));
    }

    public function find(int $id): AdmDesaKelurahanResource
    {
        return new AdmDesaKelurahanResource($this->findModel($id)->load(['wilayahAdmKecamatan', 'kodePos']));
    }

    public function update(int $id, array $data): AdmDesaKelurahanResource
    {
        $wilayahAdmDesa = $this->findModel($id);

        if (isset($data['wilayah_adm_kecamatan_id'])) {
            AdmKecamatan::findOrFail($data['wilayah_adm_kecamatan_id']);
        }

        $wilayahAdmDesa->update($data);

        return new AdmDesaKelurahanResource($wilayahAdmDesa->fresh()->load(['wilayahAdmKecamatan', 'kodePos']));
    }

    public function delete(int $id): void
    {
        $wilayahAdmDesa = $this->findModel($id);

        if ($wilayahAdmDesa->kodePos()->exists()) {
            throw ValidationException::withMessages([
                'wilayah_adm_desa' => ['Desa/kelurahan masih memiliki kode pos terkait.'],
            ]);
        }

        if ($wilayahAdmDesa->wilayahFungDesa()->exists()) {
            throw ValidationException::withMessages([
                'wilayah_adm_desa' => ['Desa/kelurahan masih dipetakan ke desa fungsional.'],
            ]);
        }

        if ($wilayahAdmDesa->jamaah()->exists()) {
            throw ValidationException::withMessages([
                'wilayah_adm_desa' => ['Desa/kelurahan masih direferensikan oleh data jamaah.'],
            ]);
        }

        $wilayahAdmDesa->delete();
    }

    private function findModel(int $id): AdmDesaKelurahan
    {
        $wilayahAdmDesa = AdmDesaKelurahan::find($id);

        if (! $wilayahAdmDesa) {
            throw new ModelNotFoundException('Desa/kelurahan tidak ditemukan.');
        }

        return $wilayahAdmDesa;
    }
}
