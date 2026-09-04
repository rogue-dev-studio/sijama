<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:38:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:25:00
 */

namespace App\Services;

use App\Http\Resources\AdmKodePosResource;
use App\Models\AdmDesaKelurahan;
use App\Models\AdmKodePos;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class AdmKodePosService
{
    private const WILAYAH_RELATIONS = [
        'wilayahAdmDesa.wilayahAdmKecamatan.wilayahAdmKabupatenKota.wilayahAdmProvinsi.wilayahAdmNegara',
    ];

    public function list(
        ?string $query = null,
        ?int $wilayahAdmDesaId = null,
        ?int $kecamatanId = null,
        ?int $wilayahAdmKabupatenKotaId = null,
        ?int $provinsiId = null,
        ?int $negaraId = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = AdmKodePos::query()->with(self::WILAYAH_RELATIONS);
        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['kode', 'is_active'],
            'kode',
        );

        if ($wilayahAdmDesaId !== null) {
            $builder->where('wilayah_adm_desa_id', $wilayahAdmDesaId);
        }

        if ($kecamatanId !== null) {
            $builder->where('wilayah_adm_kecamatan_id', $kecamatanId);
        }

        if ($wilayahAdmKabupatenKotaId !== null) {
            $builder->whereHas(
                'wilayahAdmDesa.wilayahAdmKecamatan',
                fn ($q) => $q->where('wilayah_adm_kabupaten_kota_id', $wilayahAdmKabupatenKotaId),
            );
        }

        if ($provinsiId !== null) {
            $builder->whereHas(
                'wilayahAdmDesa.wilayahAdmKecamatan.wilayahAdmKabupatenKota',
                fn ($q) => $q->where('wilayah_adm_provinsi_id', $provinsiId),
            );
        }

        if ($negaraId !== null) {
            $builder->whereHas(
                'wilayahAdmDesa.wilayahAdmKecamatan.wilayahAdmKabupatenKota.wilayahAdmProvinsi',
                fn ($q) => $q->where('wilayah_adm_negara_id', $negaraId),
            );
        }

        if ($query) {
            $term = trim($query);
            $builder->where(function ($nested) use ($term) {
                $nested->where('kode', 'like', "%{$term}%")
                    ->orWhereHas('wilayahAdmDesa', fn ($desa) => $desa->where('nama', 'like', "%{$term}%"))
                    ->orWhereHas('wilayahAdmDesa.wilayahAdmKecamatan', fn ($kec) => $kec->where('nama', 'like', "%{$term}%"))
                    ->orWhereHas(
                        'wilayahAdmDesa.wilayahAdmKecamatan.wilayahAdmKabupatenKota',
                        fn ($kab) => $kab->where('nama', 'like', "%{$term}%"),
                    )
                    ->orWhereHas(
                        'wilayahAdmDesa.wilayahAdmKecamatan.wilayahAdmKabupatenKota.wilayahAdmProvinsi',
                        fn ($prov) => $prov->where('nama', 'like', "%{$term}%"),
                    );
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): AdmKodePosResource
    {
        $data = $this->normalizeWilayah($data);

        $kodePos = AdmKodePos::create($data);

        return new AdmKodePosResource($kodePos->load(self::WILAYAH_RELATIONS));
    }

    public function find(int $id): AdmKodePosResource
    {
        return new AdmKodePosResource($this->findModel($id)->load(self::WILAYAH_RELATIONS));
    }

    public function update(int $id, array $data): AdmKodePosResource
    {
        $kodePos = $this->findModel($id);
        $data = $this->normalizeWilayah($data, $kodePos);

        $kodePos->update($data);

        return new AdmKodePosResource($kodePos->fresh()->load(self::WILAYAH_RELATIONS));
    }

    public function delete(int $id): void
    {
        $this->findModel($id)->delete();
    }

    private function normalizeWilayah(array $data, ?AdmKodePos $existing = null): array
    {
        unset($data['wilayah_adm_kecamatan_id'], $data['nama_wilayah']);

        $desaId = $data['wilayah_adm_desa_id'] ?? $existing?->wilayah_adm_desa_id;
        if (! $desaId) {
            throw ValidationException::withMessages([
                'wilayah_adm_desa_id' => ['Desa/kelurahan wajib dipilih.'],
            ]);
        }

        $desa = AdmDesaKelurahan::query()->find($desaId);
        if (! $desa) {
            throw ValidationException::withMessages([
                'wilayah_adm_desa_id' => ['Desa/kelurahan tidak ditemukan.'],
            ]);
        }

        $data['wilayah_adm_desa_id'] = $desa->id;
        $data['wilayah_adm_kecamatan_id'] = $desa->wilayah_adm_kecamatan_id;

        return $data;
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
