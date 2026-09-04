<?php

namespace App\Services;

use App\DTOs\KegiatanData;
use App\Http\Resources\KegiatanResource;
use App\Models\AttendanceSession;
use App\Models\KategoriKegiatan;
use App\Models\Kegiatan;
use App\Models\Lokasi;
use App\Models\Pemateri;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class KegiatanService
{
    public function list(
        ?string $query = null,
        ?string $status = null,
        ?string $dateFrom = null,
        ?string $dateTo = null,
        ?int $kategoriKegiatanId = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = Kegiatan::query()
            ->with([
                'lokasiRef:id,nama,jenis',
                'pemateriRef:id,nama',
                'materi:id,nama',
                'kategoriKegiatan:id,nama,calendar_color',
            ]);

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['judul', 'jenis', 'pemateri', 'lokasi', 'tanggal', 'status'],
            'tanggal',
            'desc',
        );

        if ($query) {
            $builder->where(function ($q) use ($query) {
                $q->where('judul', 'ilike', "%{$query}%")
                    ->orWhere('lokasi', 'ilike', "%{$query}%")
                    ->orWhere('jenis', 'ilike', "%{$query}%")
                    ->orWhere('pemateri', 'ilike', "%{$query}%")
                    ->orWhereHas('materi', fn ($materi) => $materi->where('nama', 'ilike', "%{$query}%"));
            });
        }

        if ($status !== null && $status !== '') {
            $builder->where('status', $status);
        }

        if ($dateFrom !== null && $dateFrom !== '') {
            $builder->whereDate('tanggal', '>=', $dateFrom);
        }

        if ($dateTo !== null && $dateTo !== '') {
            $builder->whereDate('tanggal', '<=', $dateTo);
        }

        if ($kategoriKegiatanId !== null && $kategoriKegiatanId > 0) {
            $builder->where('kategori_kegiatan_id', $kategoriKegiatanId);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(KegiatanData $data): KegiatanResource
    {
        $attributes = $data->toModelAttributes();
        if (empty($attributes['kategori_kegiatan_id'])) {
            $attributes['kategori_kegiatan_id'] = KategoriKegiatan::query()
                ->where('nama', 'ilike', 'Pengajian')
                ->value('id');
            if ($attributes['kategori_kegiatan_id']) {
                $attributes['jenis'] = 'Pengajian';
            }
        }

        $kegiatan = Kegiatan::create($attributes);
        $kegiatan->materi()->sync($data->materiIds);

        return new KegiatanResource($kegiatan->load($this->defaultRelations()));
    }

    public function find(int $id): KegiatanResource
    {
        return new KegiatanResource($this->findModel($id)->load($this->defaultRelations()));
    }

    public function update(int $id, KegiatanData $data): KegiatanResource
    {
        $kegiatan = $this->findModel($id);
        $kegiatan->update($data->toModelAttributes());
        $kegiatan->materi()->sync($data->materiIds);

        return new KegiatanResource($kegiatan->fresh()->load($this->defaultRelations()));
    }

    /** @param  array<string, mixed>  $attributes */
    public function updatePartial(int $id, array $attributes): KegiatanResource
    {
        $kegiatan = $this->findModel($id);
        $materiIds = null;

        if (array_key_exists('materi_ids', $attributes)) {
            $materiIds = $this->normalizeMateriIds($attributes['materi_ids']);
            unset($attributes['materi_ids']);
        }

        unset($attributes['materi_id']);

        if (array_key_exists('pemateri_id', $attributes) && $attributes['pemateri_id']) {
            $attributes['pemateri'] = Pemateri::query()
                ->whereKey($attributes['pemateri_id'])
                ->value('nama') ?? ($attributes['pemateri'] ?? null);
        }

        if (array_key_exists('lokasi_id', $attributes) && $attributes['lokasi_id']) {
            $attributes['lokasi'] = Lokasi::query()
                ->whereKey($attributes['lokasi_id'])
                ->value('nama') ?? ($attributes['lokasi'] ?? null);
        }

        if (array_key_exists('kategori_kegiatan_id', $attributes) && $attributes['kategori_kegiatan_id']) {
            $attributes['jenis'] = KategoriKegiatan::query()
                ->whereKey($attributes['kategori_kegiatan_id'])
                ->value('nama') ?? ($attributes['jenis'] ?? null);
        }

        foreach (['jam_mulai', 'jam_selesai'] as $timeField) {
            if (! array_key_exists($timeField, $attributes) || $attributes[$timeField] === null || $attributes[$timeField] === '') {
                continue;
            }

            if (strlen((string) $attributes[$timeField]) === 5) {
                $attributes[$timeField] = $attributes[$timeField].':00';
            }
        }

        $kegiatan->update($attributes);

        if ($materiIds !== null) {
            $kegiatan->materi()->sync($materiIds);
        }

        return new KegiatanResource($kegiatan->fresh()->load($this->defaultRelations()));
    }

    public function delete(int $id): void
    {
        $kegiatan = $this->findModel($id);

        if (AttendanceSession::query()
            ->where('type', 'kegiatan')
            ->where('ref_id', $id)
            ->exists()) {
            throw ValidationException::withMessages([
                'kegiatan' => ['Kegiatan masih memiliki sesi absensi terkait.'],
            ]);
        }

        $kegiatan->delete();
    }

    /** @return list<string> */
    private function defaultRelations(): array
    {
        return ['lokasiRef', 'pemateriRef', 'materi', 'kategoriKegiatan'];
    }

    /** @return list<int> */
    private function normalizeMateriIds(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map('intval', $value))));
    }

    private function findModel(int $id): Kegiatan
    {
        $kegiatan = Kegiatan::find($id);

        if (! $kegiatan) {
            throw new ModelNotFoundException('Kegiatan tidak ditemukan.');
        }

        return $kegiatan;
    }
}
