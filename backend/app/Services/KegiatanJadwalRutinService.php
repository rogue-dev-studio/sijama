<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 18:05:00
 */

namespace App\Services;

use App\Http\Resources\KegiatanJadwalRutinResource;
use App\Models\Daerah;
use App\Models\Desa;
use App\Models\Kelompok;
use App\Models\KegiatanJadwalRutin;
use App\Models\Lokasi;
use App\Models\Pemateri;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class KegiatanJadwalRutinService
{
    public function __construct(
        private readonly ScopeService $scopeService,
        private readonly KegiatanRutinGeneratorService $generatorService,
    ) {}

    public function list(
        ?string $query = null,
        ?bool $isActive = null,
        ?string $scopeLevel = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
        ?User $actor = null,
    ): LengthAwarePaginator {
        $builder = KegiatanJadwalRutin::query()
            ->with([
                'kategoriKegiatan:id,nama',
                'lokasiRef:id,nama,jenis',
                'pemateriRef:id,nama',
                'materi:id,nama',
                'wilayahFungDaerah:id,nama',
                'wilayahFungDesa:id,nama',
                'wilayahFungKelompok:id,nama',
            ]);

        if ($actor instanceof User) {
            $this->applyScopeFilter($builder, $actor);
        }

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['judul', 'frekuensi', 'scope_level', 'effective_from', 'is_active'],
            'effective_from',
            'desc',
        );

        if ($query) {
            $builder->where(function ($q) use ($query) {
                $q->where('judul', 'ilike', "%{$query}%")
                    ->orWhere('deskripsi', 'ilike', "%{$query}%");
            });
        }

        if ($isActive !== null) {
            $builder->where('is_active', $isActive);
        }

        if ($scopeLevel !== null && $scopeLevel !== '') {
            $builder->where('scope_level', $scopeLevel);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data, User $actor): array
    {
        $materiIds = $this->extractMateriIds($data);
        $attributes = $this->normalizeScopeAttributes($data, $actor);
        $attributes = $this->resolveMasterReferences($attributes);
        $attributes['created_by'] = $actor->id;
        $attributes['is_active'] = true;
        $attributes['last_generated_until'] = null;

        $jadwal = KegiatanJadwalRutin::query()->create($attributes);
        $jadwal->materi()->sync($materiIds);
        $created = $this->generatorService->syncSchedule($jadwal->fresh());

        return [
            'created' => $created,
            'jadwal' => new KegiatanJadwalRutinResource(
                $jadwal->fresh()->load($this->defaultRelations())
            ),
        ];
    }

    public function find(int $id, User $actor): KegiatanJadwalRutinResource
    {
        $jadwal = $this->findModel($id);
        $this->assertInScope($actor, $jadwal);

        return new KegiatanJadwalRutinResource(
            $jadwal->load($this->defaultRelations())
        );
    }

    public function update(int $id, array $data, User $actor): KegiatanJadwalRutinResource
    {
        $jadwal = $this->findModel($id);
        $this->assertInScope($actor, $jadwal);

        if (! $jadwal->is_active) {
            throw ValidationException::withMessages([
                'jadwal' => ['Jadwal nonaktif tidak dapat diubah. Buat jadwal baru sebagai pengganti.'],
            ]);
        }

        $materiIds = $this->extractMateriIds($data);
        $attributes = $this->normalizeScopeAttributes($data, $actor, $jadwal);
        $attributes = $this->resolveMasterReferences($attributes);
        $jadwal->update($attributes);
        $jadwal->materi()->sync($materiIds);
        $jadwal = $jadwal->fresh();
        $this->generatorService->syncSchedule($jadwal);

        return new KegiatanJadwalRutinResource(
            $jadwal->load($this->defaultRelations())
        );
    }

    public function deactivate(int $id, User $actor): KegiatanJadwalRutinResource
    {
        $jadwal = $this->findModel($id);
        $this->assertInScope($actor, $jadwal);

        if (! $jadwal->is_active) {
            return new KegiatanJadwalRutinResource(
                $jadwal->load($this->defaultRelations())
            );
        }

        $jadwal->update(['is_active' => false]);

        return new KegiatanJadwalRutinResource(
            $jadwal->fresh()->load($this->defaultRelations())
        );
    }

    public function generateNow(int $id, User $actor): array
    {
        $jadwal = $this->findModel($id);
        $this->assertInScope($actor, $jadwal);

        if (! $jadwal->is_active) {
            throw ValidationException::withMessages([
                'jadwal' => ['Jadwal nonaktif tidak dapat menghasilkan kegiatan baru.'],
            ]);
        }

        $created = $this->generatorService->syncSchedule($jadwal->fresh());

        return [
            'created' => $created,
            'jadwal' => new KegiatanJadwalRutinResource(
                $jadwal->fresh()->load($this->defaultRelations())
            ),
        ];
    }

    /** @param Builder<KegiatanJadwalRutin> $builder */
    private function applyScopeFilter(Builder $builder, User $user): void
    {
        if ($this->scopeService->isGlobal($user)) {
            return;
        }

        $builder->where(function ($query) use ($user) {
            match ($this->scopeService->tingkat($user)) {
                'pusat' => $query->where(function ($scoped) use ($user) {
                    $scoped->whereHas('wilayahFungDaerah', fn ($q) => $q->where('wilayah_fung_pusat_id', $user->wilayah_fung_pusat_id))
                        ->orWhereHas('wilayahFungDesa.wilayahFungDaerah', fn ($q) => $q->where('wilayah_fung_pusat_id', $user->wilayah_fung_pusat_id))
                        ->orWhereHas('wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah', fn ($q) => $q->where('wilayah_fung_pusat_id', $user->wilayah_fung_pusat_id));
                }),
                'daerah' => $query->where(function ($scoped) use ($user) {
                    $scoped->where('wilayah_fung_daerah_id', $user->wilayah_fung_daerah_id)
                        ->orWhereHas('wilayahFungDesa', fn ($q) => $q->where('wilayah_fung_daerah_id', $user->wilayah_fung_daerah_id))
                        ->orWhereHas('wilayahFungKelompok.wilayahFungDesa', fn ($q) => $q->where('wilayah_fung_daerah_id', $user->wilayah_fung_daerah_id));
                }),
                'desa' => $query->where(function ($scoped) use ($user) {
                    $scoped->where('wilayah_fung_desa_id', $user->wilayah_fung_desa_id)
                        ->orWhereHas('wilayahFungKelompok', fn ($q) => $q->where('wilayah_fung_desa_id', $user->wilayah_fung_desa_id));
                }),
                'kelompok' => $query->where('wilayah_fung_kelompok_id', $user->wilayah_fung_kelompok_id),
                default => $query->whereKey([]),
            };
        });
    }

    private function assertInScope(User $actor, KegiatanJadwalRutin $jadwal): void
    {
        if ($this->scopeService->isGlobal($actor)) {
            return;
        }

        $builder = KegiatanJadwalRutin::query()->whereKey($jadwal->id);
        $this->applyScopeFilter($builder, $actor);

        if (! $builder->exists()) {
            throw ValidationException::withMessages([
                'jadwal' => ['Jadwal di luar cakupan akses Anda.'],
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalizeScopeAttributes(array $data, User $actor, ?KegiatanJadwalRutin $existing = null): array
    {
        $scopeLevel = (string) ($data['scope_level'] ?? $existing?->scope_level);
        $this->assertScopeLevelAllowed($actor, $scopeLevel);

        $attributes = $data;
        $attributes['scope_level'] = $scopeLevel;
        $attributes['wilayah_fung_daerah_id'] = null;
        $attributes['wilayah_fung_desa_id'] = null;
        $attributes['wilayah_fung_kelompok_id'] = null;

        if ($scopeLevel === KegiatanJadwalRutin::SCOPE_DAERAH) {
            $daerahId = (int) ($data['wilayah_fung_daerah_id'] ?? 0);
            $daerah = Daerah::query()->find($daerahId);
            if (! $daerah) {
                throw ValidationException::withMessages(['wilayah_fung_daerah_id' => ['Daerah wajib dipilih.']]);
            }
            $this->scopeService->assertDaerahInScope($actor, $daerah);
            $attributes['wilayah_fung_daerah_id'] = $daerah->id;
        }

        if ($scopeLevel === KegiatanJadwalRutin::SCOPE_DESA) {
            $desaId = (int) ($data['wilayah_fung_desa_id'] ?? 0);
            $desa = Desa::query()->with('wilayahFungDaerah')->find($desaId);
            if (! $desa) {
                throw ValidationException::withMessages(['wilayah_fung_desa_id' => ['Desa wajib dipilih.']]);
            }
            $this->scopeService->assertDesaInScope($actor, $desa);
            $attributes['wilayah_fung_desa_id'] = $desa->id;
            $attributes['wilayah_fung_daerah_id'] = $desa->wilayah_fung_daerah_id;
        }

        if ($scopeLevel === KegiatanJadwalRutin::SCOPE_KELOMPOK) {
            $kelompokId = isset($data['wilayah_fung_kelompok_id']) ? (int) $data['wilayah_fung_kelompok_id'] : 0;
            if ($kelompokId <= 0) {
                $kelompokId = $this->scopeService->resolveKelompokIdForCreate($actor, null);
            } elseif ($this->scopeService->tingkat($actor) === 'kelompok') {
                $kelompokId = $this->scopeService->resolveKelompokIdForCreate($actor, $kelompokId);
            }
            $kelompok = Kelompok::query()->with('wilayahFungDesa.wilayahFungDaerah')->find($kelompokId);
            if (! $kelompok) {
                throw ValidationException::withMessages(['wilayah_fung_kelompok_id' => ['Kelompok wajib dipilih.']]);
            }
            $this->scopeService->assertKelompokInScope($actor, $kelompok);
            $attributes['wilayah_fung_kelompok_id'] = $kelompok->id;
            $attributes['wilayah_fung_desa_id'] = $kelompok->wilayah_fung_desa_id;
            $attributes['wilayah_fung_daerah_id'] = $kelompok->wilayahFungDesa?->wilayah_fung_daerah_id;
        }

        return $attributes;
    }

    /** @return list<string> */
    private function defaultRelations(): array
    {
        return ['kategoriKegiatan', 'lokasiRef', 'pemateriRef', 'materi', 'wilayahFungDaerah', 'wilayahFungDesa', 'wilayahFungKelompok'];
    }

    /** @param  array<string, mixed>  $data */
    private function extractMateriIds(array &$data): array
    {
        $ids = [];
        if (isset($data['materi_ids']) && is_array($data['materi_ids'])) {
            $ids = array_values(array_unique(array_filter(array_map('intval', $data['materi_ids']))));
        }

        unset($data['materi_ids'], $data['materi_id']);

        return $ids;
    }

    /** @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function resolveMasterReferences(array $attributes): array
    {
        if (! empty($attributes['pemateri_id'])) {
            $attributes['pemateri'] = Pemateri::query()
                ->whereKey($attributes['pemateri_id'])
                ->value('nama') ?? ($attributes['pemateri'] ?? null);
        }

        if (! empty($attributes['lokasi_id'])) {
            $attributes['lokasi'] = Lokasi::query()
                ->whereKey($attributes['lokasi_id'])
                ->value('nama') ?? ($attributes['lokasi'] ?? null);
        }

        return $attributes;
    }

    private function assertScopeLevelAllowed(User $actor, string $scopeLevel): void
    {
        if ($this->scopeService->isGlobal($actor)) {
            return;
        }

        $allowed = match ($this->scopeService->tingkat($actor)) {
            'pusat', 'daerah' => [
                KegiatanJadwalRutin::SCOPE_DAERAH,
                KegiatanJadwalRutin::SCOPE_DESA,
                KegiatanJadwalRutin::SCOPE_KELOMPOK,
            ],
            'desa' => [
                KegiatanJadwalRutin::SCOPE_DESA,
                KegiatanJadwalRutin::SCOPE_KELOMPOK,
            ],
            'kelompok' => [KegiatanJadwalRutin::SCOPE_KELOMPOK],
            default => [],
        };

        if (! in_array($scopeLevel, $allowed, true)) {
            throw ValidationException::withMessages([
                'scope_level' => ['Level cakupan jadwal tidak diizinkan untuk dapukan Anda.'],
            ]);
        }
    }

    private function findModel(int $id): KegiatanJadwalRutin
    {
        $jadwal = KegiatanJadwalRutin::query()->find($id);

        if (! $jadwal) {
            throw new ModelNotFoundException('Jadwal rutin kegiatan tidak ditemukan.');
        }

        return $jadwal;
    }
}
