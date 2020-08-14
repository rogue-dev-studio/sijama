<?php

namespace App\Services;

use App\DTOs\KegiatanData;
use App\Http\Resources\KegiatanResource;
use App\Models\AttendanceSession;
use App\Models\Kegiatan;
use App\Support\PaginationHelper;
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
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $builder = Kegiatan::query()
            ->with(['lokasiRef:id,kode,nama,jenis', 'kategoriKegiatan:id,kode,nama'])
            ->orderByDesc('tanggal');

        if ($query) {
            $builder->where(function ($q) use ($query) {
                $q->where('judul', 'ilike', "%{$query}%")
                    ->orWhere('lokasi', 'ilike', "%{$query}%")
                    ->orWhere('jenis', 'ilike', "%{$query}%");
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

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(KegiatanData $data): KegiatanResource
    {
        $kegiatan = Kegiatan::create($data->toModelAttributes());

        return new KegiatanResource($kegiatan->load(['lokasiRef', 'kategoriKegiatan']));
    }

    public function find(int $id): KegiatanResource
    {
        return new KegiatanResource($this->findModel($id)->load(['lokasiRef', 'kategoriKegiatan']));
    }

    public function update(int $id, KegiatanData $data): KegiatanResource
    {
        $kegiatan = $this->findModel($id);
        $kegiatan->update($data->toModelAttributes());

        return new KegiatanResource($kegiatan->fresh()->load(['lokasiRef', 'kategoriKegiatan']));
    }

    public function updatePartial(int $id, array $attributes): KegiatanResource
    {
        $kegiatan = $this->findModel($id);
        $kegiatan->update($attributes);

        return new KegiatanResource($kegiatan->fresh()->load(['lokasiRef', 'kategoriKegiatan']));
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

    private function findModel(int $id): Kegiatan
    {
        $kegiatan = Kegiatan::find($id);

        if (! $kegiatan) {
            throw new ModelNotFoundException('Kegiatan tidak ditemukan.');
        }

        return $kegiatan;
    }
}
