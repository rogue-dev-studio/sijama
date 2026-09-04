<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:40:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:40:00
 */

namespace App\Services;

use App\Http\Resources\AdmProvinsiResource;
use App\Models\AdmNegara;
use App\Models\AdmProvinsi;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class AdmProvinsiService
{
    public function list(
        ?string $query = null,
        ?int $negaraId = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = AdmProvinsi::query()->with('wilayahAdmNegara');
        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['nama', 'kode', 'is_active'],
            'nama',
        );

        if ($negaraId !== null) {
            $builder->where('wilayah_adm_negara_id', $negaraId);
        }

        if ($query) {
            SearchHelper::likeGroup($builder, ['nama', 'kode'], $query);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): AdmProvinsiResource
    {
        AdmNegara::findOrFail($data['wilayah_adm_negara_id']);

        $provinsi = AdmProvinsi::create($data);

        return new AdmProvinsiResource($provinsi->load('wilayahAdmNegara'));
    }

    public function find(int $id): AdmProvinsiResource
    {
        return new AdmProvinsiResource($this->findModel($id)->load('wilayahAdmNegara'));
    }

    public function update(int $id, array $data): AdmProvinsiResource
    {
        $provinsi = $this->findModel($id);

        if (isset($data['wilayah_adm_negara_id'])) {
            AdmNegara::findOrFail($data['wilayah_adm_negara_id']);
        }

        $provinsi->update($data);

        return new AdmProvinsiResource($provinsi->fresh()->load('wilayahAdmNegara'));
    }

    public function delete(int $id): void
    {
        $provinsi = $this->findModel($id);

        if ($provinsi->wilayahAdmKabupatenKota()->exists()) {
            throw ValidationException::withMessages([
                'wilayah_adm_provinsi' => ['Provinsi masih memiliki kabupaten/kota terkait.'],
            ]);
        }

        $provinsi->delete();
    }

    private function findModel(int $id): AdmProvinsi
    {
        $provinsi = AdmProvinsi::find($id);

        if (! $provinsi) {
            throw new ModelNotFoundException('Provinsi tidak ditemukan.');
        }

        return $provinsi;
    }
}
