<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

namespace App\Services;

use App\DTOs\KeluargaData;
use App\Http\Resources\KeluargaResource;
use App\Models\Jamaah;
use App\Models\JamaahKeluarga;
use App\Models\Keluarga;
use App\Models\LookupM;
use App\Models\User;
use App\Support\LookupTypes;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class KeluargaService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    public function list(
        User $user,
        ?string $query = null,
        ?string $status = null,
        ?int $wilayah_fung_kelompokId = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = Keluarga::query()
            ->with([
                'wilayahFungKelompok:id,kode,nama',
                'kepalaJamaah:id,nama,nik,no_hp',
                'wilayahAdmDesa:id,kode,nama',
            ])
            ->withCount('anggota');

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            [
                'no_kk',
                'status',
                'kepala' => 'kepala_jamaah_id',
                'wilayah_fung_kelompok' => 'wilayah_fung_kelompok_id',
                'anggota' => 'anggota_count',
            ],
            'no_kk',
        );

        $this->scopeService->applyKeluargaScope($builder, $user);

        if ($query) {
            $builder->where(function ($q) use ($query) {
                SearchHelper::likeGroup($q, ['no_kk', 'alamat'], $query);
                $q->orWhereHas('kepalaJamaah', fn ($sub) => SearchHelper::likeGroup($sub, ['nama', 'nik'], $query));
            });
        }

        if ($status === 'aktif' || $status === 'nonaktif') {
            $builder->where('status', $status);
        }

        if ($wilayah_fung_kelompokId !== null) {
            $builder->where('wilayah_fung_kelompok_id', $wilayah_fung_kelompokId);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    /**
     * @return \Illuminate\Support\Collection<int, Jamaah>
     */
    public function jamaahOptionsForForm(
        User $user,
        ?int $wilayah_fung_kelompokId = null,
        ?int $exceptKeluargaId = null,
    ) {
        $registeredIds = JamaahKeluarga::query()
            ->when($exceptKeluargaId, fn ($q) => $q->where('keluarga_id', '!=', $exceptKeluargaId))
            ->pluck('jamaah_id');

        $builder = Jamaah::query()
            ->select([
                'id',
                'wilayah_fung_kelompok_id',
                'nik',
                'nama',
                'no_hp',
                'alamat',
                'rt',
                'rw',
                'wilayah_adm_desa_id',
                'kode_pos',
            ])
            ->where('status', 'aktif')
            ->whereNotIn('id', $registeredIds)
            ->orderBy('nama');

        $this->scopeService->applyJamaahScope($builder, $user);

        if ($wilayah_fung_kelompokId !== null) {
            $builder->where('wilayah_fung_kelompok_id', $wilayah_fung_kelompokId);
        }

        return $builder->get();
    }

    public function create(KeluargaData $data, User $user): KeluargaResource
    {
        return DB::transaction(function () use ($data, $user) {
            $kepala = $this->resolveJamaahInScope($data->kepalaJamaahId, $user);
            $kelompokId = $data->wilayah_fung_kelompokId !== null
                ? $this->scopeService->resolveKelompokIdForCreate($user, $data->wilayah_fung_kelompokId)
                : $this->scopeService->resolveKelompokIdForCreate($user, $kepala->wilayah_fung_kelompok_id);

            if ($kepala->wilayah_fung_kelompok_id !== $kelompokId) {
                throw ValidationException::withMessages([
                    'kepala_jamaah_id' => ['Kepala keluarga harus berasal dari kelompok yang sama.'],
                ]);
            }

            $this->assertJamaahAvailable($data->kepalaJamaahId);

            $keluarga = Keluarga::create(array_merge(
                $data->toModelAttributes(),
                ['wilayah_fung_kelompok_id' => $kelompokId]
            ));

            $this->syncAnggota($keluarga, $data, $user);

            return $this->resource($keluarga->fresh());
        });
    }

    public function find(int $id, User $user): KeluargaResource
    {
        return $this->resource($this->findModel($id, $user));
    }

    public function update(int $id, KeluargaData $data, User $user): KeluargaResource
    {
        return DB::transaction(function () use ($id, $data, $user) {
            $keluarga = $this->findModel($id, $user);
            $kepala = $this->resolveJamaahInScope($data->kepalaJamaahId, $user);

            $kelompokId = $data->wilayah_fung_kelompokId !== null
                ? $this->scopeService->resolveKelompokIdForCreate($user, $data->wilayah_fung_kelompokId)
                : $keluarga->wilayah_fung_kelompok_id;

            if ($kepala->wilayah_fung_kelompok_id !== $kelompokId) {
                throw ValidationException::withMessages([
                    'kepala_jamaah_id' => ['Kepala keluarga harus berasal dari kelompok yang sama.'],
                ]);
            }

            $this->assertJamaahAvailable($data->kepalaJamaahId, $keluarga->id);

            $attributes = $data->toModelAttributes();
            $attributes['wilayah_fung_kelompok_id'] = $kelompokId;
            $keluarga->update($attributes);

            $this->syncAnggota($keluarga, $data, $user);

            return $this->resource($keluarga->fresh());
        });
    }

    public function delete(int $id, User $user): void
    {
        $keluarga = $this->findModel($id, $user);
        $keluarga->delete();
    }

    private function findModel(int $id, User $user): Keluarga
    {
        $builder = Keluarga::query()->whereKey($id);
        $this->scopeService->applyKeluargaScope($builder, $user);

        $keluarga = $builder->first();

        if (! $keluarga) {
            throw new ModelNotFoundException('Keluarga tidak ditemukan.');
        }

        return $keluarga;
    }

    private function resource(Keluarga $keluarga): KeluargaResource
    {
        $keluarga->load([
            'wilayahFungKelompok:id,kode,nama',
            'kepalaJamaah:id,nama,nik,no_hp',
            'wilayahAdmDesa:id,kode,nama',
            'anggota:id,nama,nik,gender,tanggal_lahir,no_hp',
        ])->loadCount('anggota');

        $labels = LookupM::query()
            ->where('lookup_type', LookupTypes::HUBUNGAN_KELUARGA)
            ->where('is_deleted', false)
            ->pluck('lookup_name', 'lookup_value');

        $keluarga->anggota->each(function (Jamaah $jamaah) use ($labels) {
            $value = $jamaah->pivot->hubungan_keluarga;
            $jamaah->hubungan_keluarga_label = $labels[$value] ?? $value;
        });

        return new KeluargaResource($keluarga);
    }

    private function syncAnggota(Keluarga $keluarga, KeluargaData $data, User $user): void
    {
        $rows = collect($data->anggota)
            ->keyBy('jamaah_id')
            ->all();

        $rows[$data->kepalaJamaahId] = [
            'jamaah_id' => $data->kepalaJamaahId,
            'hubungan_keluarga' => 'kepala',
            'is_kepala_keluarga' => true,
            'catatan' => null,
        ];

        $kepalaCount = collect($rows)->filter(fn (array $row) => (bool) ($row['is_kepala_keluarga'] ?? false))->count();
        if ($kepalaCount !== 1) {
            throw ValidationException::withMessages([
                'anggota' => ['Harus ada tepat satu kepala keluarga.'],
            ]);
        }

        foreach ($rows as $jamaahId => $row) {
            if ((int) $jamaahId === $data->kepalaJamaahId) {
                continue;
            }

            $jamaah = $this->resolveJamaahInScope((int) $jamaahId, $user);
            if ($jamaah->wilayah_fung_kelompok_id !== $keluarga->wilayah_fung_kelompok_id) {
                throw ValidationException::withMessages([
                    "anggota.{$jamaahId}.jamaah_id" => ['Anggota harus berasal dari kelompok yang sama.'],
                ]);
            }

            $this->assertJamaahAvailable((int) $jamaahId, $keluarga->id);
        }

        JamaahKeluarga::query()->where('keluarga_id', $keluarga->id)->delete();

        foreach ($rows as $jamaahId => $row) {
            JamaahKeluarga::create([
                'keluarga_id' => $keluarga->id,
                'jamaah_id' => (int) $jamaahId,
                'hubungan_keluarga' => (bool) ($row['is_kepala_keluarga'] ?? false)
                    ? 'kepala'
                    : $row['hubungan_keluarga'],
                'is_kepala_keluarga' => (bool) ($row['is_kepala_keluarga'] ?? false),
                'catatan' => $row['catatan'] ?? null,
            ]);
        }

        $keluarga->update(['kepala_jamaah_id' => $data->kepalaJamaahId]);
    }

    private function resolveJamaahInScope(int $jamaahId, User $user): Jamaah
    {
        $builder = Jamaah::query()->whereKey($jamaahId);
        $this->scopeService->applyJamaahScope($builder, $user);

        $jamaah = $builder->first();
        if (! $jamaah) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Jamaah tidak ditemukan atau di luar cakupan.'],
            ]);
        }

        return $jamaah;
    }

    private function assertJamaahAvailable(int $jamaahId, ?int $exceptKeluargaId = null): void
    {
        $existing = JamaahKeluarga::query()
            ->where('jamaah_id', $jamaahId)
            ->when($exceptKeluargaId, fn ($q) => $q->where('keluarga_id', '!=', $exceptKeluargaId))
            ->exists();

        if ($existing) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Jamaah sudah terdaftar di keluarga lain.'],
            ]);
        }
    }
}
