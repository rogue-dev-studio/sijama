<?php

namespace App\Services;

use App\DTOs\JamaahData;
use App\Http\Resources\JamaahResource;
use App\Models\Dapukan;
use App\Models\Jamaah;
use App\Models\User;
use App\Support\JamaahDerivedAttributes;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class JamaahService
{
    private const FACE_MATCH_THRESHOLD = 0.42;

    public function __construct(
        private readonly ScopeService $scopeService,
        private readonly DapukanService $dapukanService,
        private readonly AuditActivityService $auditActivityService,
    ) {}

    public function list(
        User $user,
        ?string $query = null,
        bool $enrolled = false,
        ?string $status = null,
        ?int $wilayah_fung_kelompokId = null,
        ?string $face = null,
        ?string $kategoriUmur = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $includeFacePayload = $enrolled || $face === 'enrolled';

        $columns = [
            'id',
            'wilayah_fung_kelompok_id',
            'nik',
            'nama',
            'gender',
            'tanggal_lahir',
            'kategori_umur',
            'pekerjaan',
            'pekerjaan_id',
            'pendidikan',
            'golongan_darah',
            'status_pernikahan',
            'alamat',
            'rt',
            'rw',
            'no_hp',
            'email',
            'status',
            'foto_path',
            'enrolled_at',
            'wilayah_adm_desa_id',
            'kode_pos',
            'created_at',
            'updated_at',
            'deleted_at',
        ];

        if ($includeFacePayload) {
            $columns[] = 'face_descriptor';
        }

        $builder = Jamaah::query()
            ->select($columns)
            ->with(['wilayahFungKelompok:id,kode,nama', 'pekerjaanRef:lookup_id,lookup_name,lookup_value', 'dapukan:id,slug,nama,tingkat']);

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            [
                'nama',
                'nik',
                'status',
                'kategori_umur',
                'wilayah_fung_kelompok' => 'wilayah_fung_kelompok_id',
                'face' => 'enrolled_at',
                'kontak' => 'no_hp',
            ],
            'nama',
        );
        $this->scopeService->applyJamaahScope($builder, $user);

        if ($query) {
            SearchHelper::likeGroup($builder, ['nama', 'nik', 'email', 'no_hp'], $query);
        }

        if ($status === 'aktif' || $status === 'nonaktif') {
            $builder->where('status', $status);
        }

        if ($wilayah_fung_kelompokId !== null) {
            $builder->where('wilayah_fung_kelompok_id', $wilayah_fung_kelompokId);
        }

        if ($face === 'enrolled') {
            $builder->whereNotNull('face_descriptor');
        } elseif ($face === 'pending') {
            $builder->whereNull('face_descriptor');
        } elseif ($enrolled) {
            $builder->whereNotNull('face_descriptor');
        }

        if ($kategoriUmur !== null && $kategoriUmur !== '') {
            if ($kategoriUmur === 'belum') {
                $builder->whereNull('kategori_umur');
            } else {
                $builder->where('kategori_umur', $kategoriUmur);
            }
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(JamaahData $data, User $user): JamaahResource
    {
        $attributes = $data->toModelAttributes();
        $attributes['wilayah_fung_kelompok_id'] = $this->scopeService->resolveKelompokIdForCreate(
            $user,
            $data->wilayah_fung_kelompokId
        );

        $attributes = JamaahDerivedAttributes::enrich($attributes);

        $jamaah = Jamaah::create($attributes);
        $this->syncDapukan($jamaah, $data, $user);

        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_JAMAAH,
            'action' => 'jamaah_create',
            'entity_type' => 'jamaah',
            'entity_id' => $jamaah->id,
            'entity_label' => $jamaah->nama,
            'summary' => sprintf('Tambah jamaah %s', $jamaah->nama),
            'meta' => $this->jamaahAuditSnapshot($jamaah),
            'actor' => $user,
        ]);

        return new JamaahResource($jamaah->load([
            'wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah',
            'wilayahAdmDesa',
            'pekerjaanRef',
            'dapukan:id,slug,nama,tingkat',
        ]));
    }

    public function find(int $id, User $user): JamaahResource
    {
        return new JamaahResource($this->findModel($id, $user)->load([
            'wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah',
            'wilayahAdmDesa',
            'pekerjaanRef',
            'dapukan:id,slug,nama,tingkat',
        ]));
    }

    public function update(int $id, JamaahData $data, User $user): JamaahResource
    {
        $jamaah = $this->findModel($id, $user);
        $before = $this->jamaahAuditSnapshot($jamaah);
        $attributes = $data->toModelAttributes();

        if ($data->wilayah_fung_kelompokId !== null) {
            $attributes['wilayah_fung_kelompok_id'] = $this->scopeService->resolveKelompokIdForCreate(
                $user,
                $data->wilayah_fung_kelompokId
            );
        }

        $attributes = JamaahDerivedAttributes::enrich($attributes, $jamaah);

        $jamaah->update($attributes);
        $this->syncDapukan($jamaah, $data, $user);
        app(MasterUserService::class)->syncFromJamaahModel($jamaah->fresh());

        $fresh = $jamaah->fresh();
        $after = $this->jamaahAuditSnapshot($fresh);
        $diff = $this->auditActivityService->diff($before, $after);
        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_JAMAAH,
            'action' => 'jamaah_update',
            'entity_type' => 'jamaah',
            'entity_id' => $fresh->id,
            'entity_label' => $fresh->nama,
            'summary' => sprintf('Ubah jamaah %s', $fresh->nama),
            'meta' => $diff,
            'actor' => $user,
        ]);

        return new JamaahResource($fresh->load([
            'wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah',
            'wilayahAdmDesa',
            'pekerjaanRef',
            'dapukan:id,slug,nama,tingkat',
        ]));
    }

    public function updatePartial(int $id, array $attributes, User $user): JamaahResource
    {
        $jamaah = $this->findModel($id, $user);
        $before = $this->jamaahAuditSnapshot($jamaah);

        $dapukanIds = null;
        $hasDapukanIds = array_key_exists('dapukan_ids', $attributes);
        if ($hasDapukanIds) {
            $dapukanIds = collect($attributes['dapukan_ids'] ?? [])
                ->map(fn ($item) => (int) $item)
                ->unique()
                ->values()
                ->all();
            unset($attributes['dapukan_ids']);
        }

        if (array_key_exists('wilayah_fung_kelompok_id', $attributes)) {
            $attributes['wilayah_fung_kelompok_id'] = $this->scopeService->resolveKelompokIdForCreate(
                $user,
                $attributes['wilayah_fung_kelompok_id']
            );
        }

        $attributes = JamaahDerivedAttributes::enrich($attributes, $jamaah);

        $jamaah->update($attributes);

        if ($hasDapukanIds) {
            $this->applyDapukanSync($jamaah, $dapukanIds ?? [], $user);
            app(MasterUserService::class)->syncFromJamaahModel($jamaah->fresh());
        } else {
            $this->ensureJamaahKelompokDapukan($jamaah->fresh());
        }

        $fresh = $jamaah->fresh();
        $after = $this->jamaahAuditSnapshot($fresh);
        $diff = $this->auditActivityService->diff($before, $after);
        if ($hasDapukanIds) {
            $diff['changed'][] = 'dapukan_ids';
            $diff['after']['dapukan_ids'] = $dapukanIds;
        }
        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_JAMAAH,
            'action' => 'jamaah_update',
            'entity_type' => 'jamaah',
            'entity_id' => $fresh->id,
            'entity_label' => $fresh->nama,
            'summary' => sprintf('Ubah sebagian jamaah %s', $fresh->nama),
            'meta' => $diff,
            'actor' => $user,
        ]);

        return new JamaahResource($fresh->load([
            'wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah',
            'wilayahAdmDesa',
            'pekerjaanRef',
            'dapukan:id,slug,nama,tingkat',
        ]));
    }

    public function delete(int $id, User $user): void
    {
        $jamaah = $this->findModel($id, $user);
        $snapshot = $this->jamaahAuditSnapshot($jamaah);
        $label = $jamaah->nama;
        $jamaahId = $jamaah->id;
        $jamaah->delete();

        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_JAMAAH,
            'action' => 'jamaah_delete',
            'entity_type' => 'jamaah',
            'entity_id' => $jamaahId,
            'entity_label' => $label,
            'summary' => sprintf('Hapus jamaah %s', $label),
            'meta' => ['before' => $snapshot],
            'actor' => $user,
        ]);
    }

    public function enrollFace(int $id, array $faceDescriptor, User $user): JamaahResource
    {
        $jamaah = $this->findModel($id, $user);
        $hadFace = $jamaah->face_descriptor !== null;
        $this->assertFaceDescriptorUnique($id, $faceDescriptor);

        $jamaah->face_descriptor = $faceDescriptor;
        $jamaah->enrolled_at = now();
        $jamaah->save();

        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_JAMAAH,
            'action' => 'face_enroll',
            'entity_type' => 'jamaah',
            'entity_id' => $jamaah->id,
            'entity_label' => $jamaah->nama,
            'summary' => sprintf('%s wajah jamaah %s', $hadFace ? 'Perbarui' : 'Enroll', $jamaah->nama),
            'meta' => [
                'had_face_before' => $hadFace,
                'enrolled_at' => $jamaah->enrolled_at?->toIso8601String(),
            ],
            'actor' => $user,
        ]);

        return new JamaahResource($jamaah->fresh()->load('wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah'));
    }

    public function resetFace(int $id, User $user): JamaahResource
    {
        $jamaah = $this->findModel($id, $user);

        if ($jamaah->face_descriptor === null && $jamaah->enrolled_at === null) {
            throw ValidationException::withMessages([
                'face_descriptor' => ['Jamaah ini belum memiliki data wajah.'],
            ]);
        }

        $jamaah->face_descriptor = null;
        $jamaah->enrolled_at = null;
        $jamaah->save();

        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_JAMAAH,
            'action' => 'face_reset',
            'entity_type' => 'jamaah',
            'entity_id' => $jamaah->id,
            'entity_label' => $jamaah->nama,
            'summary' => sprintf('Reset wajah jamaah %s', $jamaah->nama),
            'meta' => ['has_face' => false],
            'actor' => $user,
        ]);

        return new JamaahResource($jamaah->fresh()->load('wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah'));
    }

    /**
     * @return array<string, mixed>
     */
    private function jamaahAuditSnapshot(Jamaah $jamaah): array
    {
        return [
            'nama' => $jamaah->nama,
            'nik_set' => filled($jamaah->nik),
            'gender' => $jamaah->gender,
            'status' => $jamaah->status ?? null,
            'wilayah_fung_kelompok_id' => $jamaah->wilayah_fung_kelompok_id,
            'has_face' => $jamaah->face_descriptor !== null,
            'enrolled_at' => optional($jamaah->enrolled_at)?->toIso8601String(),
        ];
    }

    private function syncDapukan(Jamaah $jamaah, JamaahData $data, User $user): void
    {
        if ($data->hasDapukanIds) {
            $this->applyDapukanSync($jamaah, $data->dapukanIds ?? [], $user);

            return;
        }

        $this->ensureJamaahKelompokDapukan($jamaah);
    }

    /**
     * @param  list<int>  $requestedIds
     */
    private function applyDapukanSync(Jamaah $jamaah, array $requestedIds, User $user): void
    {
        $requestedIds = collect($requestedIds)
            ->map(fn ($item) => (int) $item)
            ->filter(fn (int $id) => $id > 0)
            ->unique()
            ->values();

        $jamaahKelompokId = $this->resolveJamaahKelompokDapukanId();

        if (! $this->dapukanService->canAssignJamaahDapukan($user)) {
            if ($requestedIds->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'dapukan_ids' => ['Hanya admin (sesuai tingkatan) yang dapat menetapkan dapukan jamaah.'],
                ]);
            }

            $this->ensureJamaahKelompokDapukan($jamaah);

            return;
        }

        $requestedForValidation = $requestedIds
            ->reject(fn (int $id) => $jamaahKelompokId !== null && $id === $jamaahKelompokId)
            ->values();

        if ($requestedForValidation->isNotEmpty()) {
            $requested = Dapukan::query()
                ->whereIn('id', $requestedForValidation->all())
                ->get(['id', 'slug', 'nama', 'tingkat']);

            if ($requested->count() !== $requestedForValidation->count()) {
                throw ValidationException::withMessages([
                    'dapukan_ids' => ['Satu atau lebih dapukan tidak valid.'],
                ]);
            }

            $illegal = $requested
                ->filter(fn (Dapukan $item) => ! $this->dapukanService->isAssignableByUser($user, $item))
                ->pluck('nama')
                ->values();

            if ($illegal->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'dapukan_ids' => [
                        'Anda hanya dapat menetapkan dapukan setingkat atau di bawah Anda: '.$illegal->implode(', ').'.',
                    ],
                ]);
            }
        }

        $jamaah->loadMissing('dapukan:id,slug,nama,tingkat');

        $protectedIds = $jamaah->dapukan
            ->filter(fn (Dapukan $item) => ! $this->dapukanService->isAssignableByUser($user, $item))
            ->pluck('id');

        $finalIds = $protectedIds->merge($requestedIds)->unique()->values();

        if ($jamaahKelompokId && $jamaah->wilayah_fung_kelompok_id) {
            $finalIds = $finalIds->push($jamaahKelompokId)->unique()->values();
        }

        $jamaah->dapukan()->sync($finalIds->all());
    }

    private function ensureJamaahKelompokDapukan(Jamaah $jamaah): void
    {
        $jamaahKelompokId = $this->resolveJamaahKelompokDapukanId();
        if (! $jamaahKelompokId || ! $jamaah->wilayah_fung_kelompok_id) {
            return;
        }

        $jamaah->dapukan()->syncWithoutDetaching([$jamaahKelompokId]);
    }

    private function resolveJamaahKelompokDapukanId(): ?int
    {
        $id = Dapukan::query()
            ->where('slug', 'jamaah_kelompok')
            ->where('is_active', true)
            ->value('id');

        return $id ? (int) $id : null;
    }

    private function assertFaceDescriptorUnique(int $jamaahId, array $probe): void
    {
        $probe = array_map('floatval', array_values($probe));

        if (count($probe) < 1) {
            throw ValidationException::withMessages([
                'face_descriptor' => ['Descriptor wajah tidak valid.'],
            ]);
        }

        $subject = Jamaah::query()->find($jamaahId);

        $builder = Jamaah::query()
            ->whereNotNull('face_descriptor')
            ->whereKeyNot($jamaahId)
            ->select(['id', 'nama', 'face_descriptor', 'wilayah_fung_kelompok_id']);

        if ($subject?->wilayah_fung_kelompok_id) {
            $builder->where('wilayah_fung_kelompok_id', $subject->wilayah_fung_kelompok_id);
        }

        $bestName = null;
        $bestDistance = PHP_FLOAT_MAX;

        foreach ($builder->lazyById(200) as $other) {
            $candidate = $other->face_descriptor;
            if (! is_array($candidate) || count($candidate) !== count($probe)) {
                continue;
            }

            $distance = $this->euclideanDistance($probe, array_map('floatval', array_values($candidate)));
            if ($distance < $bestDistance) {
                $bestDistance = $distance;
                $bestName = $other->nama;
            }

            if ($bestDistance <= self::FACE_MATCH_THRESHOLD) {
                break;
            }
        }

        if ($bestName !== null && $bestDistance <= self::FACE_MATCH_THRESHOLD) {
            throw ValidationException::withMessages([
                'face_descriptor' => [
                    "Wajah ini sudah terdaftar atas nama {$bestName}. Tidak dapat didaftarkan ke jamaah lain.",
                ],
            ]);
        }
    }

    /**
     * @param  list<float>  $a
     * @param  list<float>  $b
     */
    private function euclideanDistance(array $a, array $b): float
    {
        $sum = 0.0;
        $count = count($a);

        for ($i = 0; $i < $count; $i++) {
            $diff = $a[$i] - $b[$i];
            $sum += $diff * $diff;
        }

        return sqrt($sum);
    }

    private function findModel(int $id, User $user): Jamaah
    {
        $jamaah = Jamaah::find($id);

        if (! $jamaah) {
            throw new ModelNotFoundException('Jamaah tidak ditemukan.');
        }

        $this->scopeService->assertJamaahInScope($user, $jamaah);

        return $jamaah;
    }
}
