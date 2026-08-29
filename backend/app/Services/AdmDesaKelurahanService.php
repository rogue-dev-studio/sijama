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
            'kecamatan',
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
            $builder->where('kecamatan_id', $kecamatanId);
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
        AdmKecamatan::findOrFail($data['kecamatan_id']);

        $desaKelurahan = AdmDesaKelurahan::create($data);

        return new AdmDesaKelurahanResource($desaKelurahan->load(['kecamatan', 'kodePos']));
    }

    public function find(int $id): AdmDesaKelurahanResource
    {
        return new AdmDesaKelurahanResource($this->findModel($id)->load(['kecamatan', 'kodePos']));
    }

    public function update(int $id, array $data): AdmDesaKelurahanResource
    {
        $desaKelurahan = $this->findModel($id);

        if (isset($data['kecamatan_id'])) {
            AdmKecamatan::findOrFail($data['kecamatan_id']);
        }

        $desaKelurahan->update($data);

        return new AdmDesaKelurahanResource($desaKelurahan->fresh()->load(['kecamatan', 'kodePos']));
    }

    public function delete(int $id): void
    {
        $desaKelurahan = $this->findModel($id);

        if ($desaKelurahan->kodePos()->exists()) {
            throw ValidationException::withMessages([
                'adm_desa_kelurahan' => ['Desa/kelurahan masih memiliki kode pos terkait.'],
            ]);
        }

        if ($desaKelurahan->desa()->exists()) {
            throw ValidationException::withMessages([
                'adm_desa_kelurahan' => ['Desa/kelurahan masih dipetakan ke desa fungsional.'],
            ]);
        }

        if ($desaKelurahan->jamaah()->exists()) {
            throw ValidationException::withMessages([
                'adm_desa_kelurahan' => ['Desa/kelurahan masih direferensikan oleh data jamaah.'],
            ]);
        }

        $desaKelurahan->delete();
    }

    private function findModel(int $id): AdmDesaKelurahan
    {
        $desaKelurahan = AdmDesaKelurahan::find($id);

        if (! $desaKelurahan) {
            throw new ModelNotFoundException('Desa/kelurahan tidak ditemukan.');
        }

        return $desaKelurahan;
    }
}
