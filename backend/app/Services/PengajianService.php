<?php

namespace App\Services;

use App\DTOs\PengajianData;
use App\Http\Resources\PengajianResource;
use App\Models\AttendanceSession;
use App\Models\Pengajian;
use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class PengajianService
{
    public function list(
        ?string $query = null,
        ?string $status = null,
        ?string $dateFrom = null,
        ?string $dateTo = null,
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $builder = Pengajian::query()
            ->with([
                'lokasiRef:id,kode,nama,jenis',
                'pemateriRef:id,kode,nama',
                'materi:id,kode,nama',
                'kategoriKegiatan:id,kode,nama,calendar_color',
            ])
            ->orderByDesc('starts_at');

        if ($query) {
            $builder->where(function ($q) use ($query) {
                $q->where('judul', 'ilike', "%{$query}%")
                    ->orWhere('lokasi', 'ilike', "%{$query}%")
                    ->orWhere('pemateri', 'ilike', "%{$query}%");
            });
        }

        if ($status !== null && $status !== '') {
            $builder->where('status', $status);
        }

        if ($dateFrom !== null && $dateFrom !== '') {
            $builder->whereDate('starts_at', '>=', $dateFrom);
        }

        if ($dateTo !== null && $dateTo !== '') {
            $builder->whereDate('starts_at', '<=', $dateTo);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(PengajianData $data): PengajianResource
    {
        $attributes = $data->toModelAttributes();
        if (empty($attributes['kategori_kegiatan_id'])) {
            $attributes['kategori_kegiatan_id'] = \App\Models\KategoriKegiatan::query()
                ->where('kode', 'pengajian')
                ->value('id');
        }

        $pengajian = Pengajian::create($attributes);

        return new PengajianResource($pengajian->load(['lokasiRef', 'pemateriRef', 'materi', 'kategoriKegiatan']));
    }

    public function find(int $id): PengajianResource
    {
        return new PengajianResource($this->findModel($id)->load(['lokasiRef', 'pemateriRef', 'materi', 'kategoriKegiatan']));
    }

    public function update(int $id, PengajianData $data): PengajianResource
    {
        $pengajian = $this->findModel($id);
        $pengajian->update($data->toModelAttributes());

        return new PengajianResource($pengajian->fresh()->load(['lokasiRef', 'pemateriRef', 'materi', 'kategoriKegiatan']));
    }

    public function updatePartial(int $id, array $attributes): PengajianResource
    {
        $pengajian = $this->findModel($id);
        $pengajian->update($attributes);

        return new PengajianResource($pengajian->fresh()->load(['lokasiRef', 'pemateriRef', 'materi', 'kategoriKegiatan']));
    }

    public function delete(int $id): void
    {
        $pengajian = $this->findModel($id);

        if (AttendanceSession::query()
            ->where('type', 'pengajian')
            ->where('ref_id', $id)
            ->exists()) {
            throw ValidationException::withMessages([
                'pengajian' => ['Pengajian masih memiliki sesi absensi terkait.'],
            ]);
        }

        $pengajian->delete();
    }

    private function findModel(int $id): Pengajian
    {
        $pengajian = Pengajian::find($id);

        if (! $pengajian) {
            throw new ModelNotFoundException('Pengajian tidak ditemukan.');
        }

        return $pengajian;
    }
}
