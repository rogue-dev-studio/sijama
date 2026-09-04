<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 18:10:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKegiatanJadwalRutinRequest;
use App\Http\Requests\UpdateKegiatanJadwalRutinRequest;
use App\Http\Resources\KegiatanJadwalRutinResource;
use App\Http\Responses\ApiResponse;
use App\Services\KegiatanJadwalRutinService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KegiatanJadwalRutinController extends Controller
{
    public function __construct(private readonly KegiatanJadwalRutinService $service) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->service->list(
            $request->query('q'),
            $request->has('is_active') ? $request->boolean('is_active') : null,
            $request->query('scope_level') ?: null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
            $request->user(),
        );

        return ApiResponse::success([
            'items' => KegiatanJadwalRutinResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreKegiatanJadwalRutinRequest $request): JsonResponse
    {
        $jadwal = $this->service->create($request->validated(), $request->user());

        return ApiResponse::success($jadwal, 'Jadwal rutin kegiatan berhasil ditambahkan', 201);
    }

    public function show(Request $request, int $jadwal): JsonResponse
    {
        return ApiResponse::success($this->service->find($jadwal, $request->user()));
    }

    public function update(UpdateKegiatanJadwalRutinRequest $request, int $jadwal): JsonResponse
    {
        $updated = $this->service->update($jadwal, $request->validated(), $request->user());

        return ApiResponse::success($updated, 'Jadwal rutin kegiatan berhasil diperbarui');
    }

    public function deactivate(Request $request, int $jadwal): JsonResponse
    {
        $updated = $this->service->deactivate($jadwal, $request->user());

        return ApiResponse::success($updated, 'Jadwal rutin kegiatan berhasil dinonaktifkan');
    }

    public function generate(Request $request, int $jadwal): JsonResponse
    {
        $result = $this->service->generateNow($jadwal, $request->user());

        return ApiResponse::success($result, 'Pembuatan kegiatan dari jadwal selesai');
    }
}
