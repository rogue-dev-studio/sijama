<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:39:06
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 19:05:00
 */

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LaporanService
{
    public function __construct(
        private readonly JamaahService $jamaahService,
        private readonly KegiatanService $kegiatanService,
        private readonly ScopeService $scopeService,
    ) {}

    public function kehadiran(
        User $user,
        ?string $dateFrom = null,
        ?string $dateTo = null,
        ?string $type = null,
        ?string $method = null,
        ?string $query = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = Attendance::query()
            ->with([
                'jamaah:id,nama,wilayah_fung_kelompok_id',
                'jamaah.wilayahFungKelompok:id,nama',
                'session:id,type,ref_id,title,status,opened_at',
            ]);

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['recorded_at', 'method'],
            'recorded_at',
            'desc',
        );

        if ($dateFrom) {
            $builder->whereDate('recorded_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $builder->whereDate('recorded_at', '<=', $dateTo);
        }
        if ($method) {
            $builder->where('method', $method);
        }
        if ($type) {
            $builder->whereHas('session', fn ($q) => $q->where('type', $type));
        }
        if ($query) {
            $builder->whereHas('jamaah', fn ($q) => $q->where('nama', 'ilike', "%{$query}%"));
        }

        $builder->whereHas('jamaah', fn ($q) => $this->scopeService->applyJamaahScope($q, $user));

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function jamaah(
        User $user,
        ?string $query = null,
        ?string $status = null,
        ?string $face = null,
        ?int $wilayah_fung_kelompokId = null,
        ?string $kategoriUmur = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        return $this->jamaahService->list(
            $user,
            $query,
            false,
            $status,
            $wilayah_fung_kelompokId,
            $face,
            $kategoriUmur,
            $perPage,
            $page,
            $sortBy,
            $sortDir,
        );
    }

    public function kegiatan(
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
        return $this->kegiatanService->list(
            $query,
            $status,
            $dateFrom,
            $dateTo,
            $kategoriKegiatanId,
            $perPage,
            $page,
            $sortBy,
            $sortDir,
        );
    }

    /**
     * @return array{items: list<array<string, mixed>>, meta: array<string, int>}
     */
    public function mapKehadiranPage(LengthAwarePaginator $paginator): array
    {
        $items = [];
        foreach ($paginator->items() as $row) {
            /** @var Attendance $row */
            $items[] = [
                'id' => $row->id,
                'recorded_at' => $row->recorded_at?->toIso8601String(),
                'method' => $row->method,
                'jamaah_id' => $row->jamaah_id,
                'jamaah_nama' => $row->jamaah?->nama,
                'kelompok_nama' => $row->jamaah?->wilayahFungKelompok?->nama,
                'session_id' => $row->session_id,
                'session_title' => $row->session?->title,
                'session_type' => $row->session?->type,
                'session_status' => $row->session?->status,
            ];
        }

        return [
            'items' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ];
    }
}
