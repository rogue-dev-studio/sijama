<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:39:06
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 15:39:06
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\JamaahResource;
use App\Http\Resources\KegiatanResource;
use App\Http\Resources\PengajianResource;
use App\Http\Responses\ApiResponse;
use App\Services\LaporanService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    public function __construct(private readonly LaporanService $laporanService) {}

    public function kehadiran(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->laporanService->kehadiran(
            $request->query('date_from'),
            $request->query('date_to'),
            $request->query('type'),
            $request->query('method'),
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success($this->laporanService->mapKehadiranPage($paginator));
    }

    public function jamaah(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->laporanService->jamaah(
            $request->user(),
            $request->query('q'),
            $request->query('status'),
            $request->query('face'),
            $request->filled('kelompok_id') ? $request->integer('kelompok_id') : null,
            $request->query('kategori_umur'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => JamaahResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function pengajian(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->laporanService->pengajian(
            $request->query('q'),
            $request->query('status'),
            $request->query('date_from'),
            $request->query('date_to'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => PengajianResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function kegiatan(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->laporanService->kegiatan(
            $request->query('q'),
            $request->query('status'),
            $request->query('date_from'),
            $request->query('date_to'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => KegiatanResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }
}
