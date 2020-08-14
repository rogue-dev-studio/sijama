<?php

namespace App\Services;

use App\DTOs\JamaahData;
use App\Http\Resources\JamaahResource;
use App\Models\Jamaah;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class JamaahService
{
    private const FACE_MATCH_THRESHOLD = 0.42;

    public function __construct(private readonly ScopeService $scopeService) {}

    public function list(
        User $user,
        ?string $query = null,
        bool $enrolled = false,
        ?string $status = null,
        ?int $kelompokId = null,
        ?string $face = null,
        ?string $kategoriUmur = null,
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $includeFacePayload = $enrolled || $face === 'enrolled';

        $columns = [
            'id',
            'kelompok_id',
            'nik',
            'nama',
            'gender',
            'tanggal_lahir',
            'kategori_umur',
            'pekerjaan',
            'pekerjaan_id',
            'pendidikan',
            'status_pernikahan',
            'alamat',
            'rt',
            'rw',
            'no_hp',
            'email',
            'status',
            'foto_path',
            'enrolled_at',
            'adm_desa_kelurahan_id',
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
            ->with(['kelompok:id,kode,nama', 'pekerjaanRef:id,kode,nama', 'dapukan:id,kode,nama,tingkat'])
            ->orderBy('nama');
        $this->scopeService->applyJamaahScope($builder, $user);

        if ($query) {
            SearchHelper::likeGroup($builder, ['nama', 'nik', 'email', 'no_hp'], $query);
        }

        if ($status === 'aktif' || $status === 'nonaktif') {
            $builder->where('status', $status);
        }

        if ($kelompokId !== null) {
            $builder->where('kelompok_id', $kelompokId);
        }

        if ($face === 'enrolled') {
            $builder->whereNotNull('face_descriptor');
        } elseif ($face === 'pending') {
            $builder->whereNull('face_descriptor');
        } elseif ($enrolled) {
            $builder->whereNotNull('face_descriptor');
        }

        if ($kategoriUmur !== null && $kategoriUmur !== '') {
            $builder->where('kategori_umur', $kategoriUmur);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(JamaahData $data, User $user): JamaahResource
    {
        $attributes = $data->toModelAttributes();
        $attributes['kelompok_id'] = $this->scopeService->resolveKelompokIdForCreate(
            $user,
            $data->kelompokId
        );

        $jamaah = Jamaah::create($attributes);
        $this->syncDapukan($jamaah, $data);

        return new JamaahResource($jamaah->load([
            'kelompok.desa.daerah',
            'admDesaKelurahan',
            'pekerjaanRef',
            'dapukan:id,kode,nama,tingkat',
        ]));
    }

    public function find(int $id, User $user): JamaahResource
    {
        return new JamaahResource($this->findModel($id, $user)->load([
            'kelompok.desa.daerah',
            'admDesaKelurahan',
            'pekerjaanRef',
            'dapukan:id,kode,nama,tingkat',
        ]));
    }

    public function update(int $id, JamaahData $data, User $user): JamaahResource
    {
        $jamaah = $this->findModel($id, $user);
        $attributes = $data->toModelAttributes();

        if ($data->kelompokId !== null) {
            $attributes['kelompok_id'] = $this->scopeService->resolveKelompokIdForCreate(
                $user,
                $data->kelompokId
            );
        }

        $jamaah->update($attributes);
        $this->syncDapukan($jamaah, $data);
        app(MasterUserService::class)->syncFromJamaahModel($jamaah->fresh());

        return new JamaahResource($jamaah->fresh()->load([
            'kelompok.desa.daerah',
            'admDesaKelurahan',
            'pekerjaanRef',
            'dapukan:id,kode,nama,tingkat',
        ]));
    }

    public function updatePartial(int $id, array $attributes, User $user): JamaahResource
    {
        $jamaah = $this->findModel($id, $user);

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

        if (array_key_exists('kelompok_id', $attributes)) {
            $attributes['kelompok_id'] = $this->scopeService->resolveKelompokIdForCreate(
                $user,
                $attributes['kelompok_id']
            );
        }

        $jamaah->update($attributes);

        if ($hasDapukanIds) {
            $jamaah->dapukan()->sync($dapukanIds ?? []);
            app(MasterUserService::class)->syncFromJamaahModel($jamaah->fresh());
        }

        return new JamaahResource($jamaah->fresh()->load([
            'kelompok.desa.daerah',
            'admDesaKelurahan',
            'pekerjaanRef',
            'dapukan:id,kode,nama,tingkat',
        ]));
    }

    public function delete(int $id, User $user): void
    {
        $this->findModel($id, $user)->delete();
    }

    public function enrollFace(int $id, array $faceDescriptor, User $user): JamaahResource
    {
        $jamaah = $this->findModel($id, $user);
        $this->assertFaceDescriptorUnique($id, $faceDescriptor);

        $jamaah->face_descriptor = $faceDescriptor;
        $jamaah->enrolled_at = now();
        $jamaah->save();

        return new JamaahResource($jamaah->fresh()->load('kelompok.desa.daerah'));
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

        return new JamaahResource($jamaah->fresh()->load('kelompok.desa.daerah'));
    }

    private function syncDapukan(Jamaah $jamaah, JamaahData $data): void
    {
        if (! $data->hasDapukanIds) {
            return;
        }

        $jamaah->dapukan()->sync($data->dapukanIds ?? []);
    }

    private function assertFaceDescriptorUnique(int $jamaahId, array $probe): void
    {
        $probe = array_map('floatval', array_values($probe));

        if (count($probe) < 1) {
            throw ValidationException::withMessages([
                'face_descriptor' => ['Descriptor wajah tidak valid.'],
            ]);
        }

        $enrolled = Jamaah::query()
            ->whereNotNull('face_descriptor')
            ->whereKeyNot($jamaahId)
            ->get(['id', 'nama', 'face_descriptor']);

        $bestName = null;
        $bestDistance = PHP_FLOAT_MAX;

        foreach ($enrolled as $other) {
            $candidate = $other->face_descriptor;
            if (! is_array($candidate) || count($candidate) !== count($probe)) {
                continue;
            }

            $distance = $this->euclideanDistance($probe, array_map('floatval', array_values($candidate)));
            if ($distance < $bestDistance) {
                $bestDistance = $distance;
                $bestName = $other->nama;
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
