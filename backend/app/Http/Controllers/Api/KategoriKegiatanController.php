<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKategoriKegiatanRequest;
use App\Http\Requests\UpdateKategoriKegiatanRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\KategoriKegiatanResource;
use App\Services\KategoriKegiatanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KategoriKegiatanController extends Controller
{
    public function __construct(private readonly KategoriKegiatanService $kategoriKegiatanService) {}

    public function index(Request $request): JsonResponse
    {
        $activeFilter = $request->has('is_active')
            ? $request->boolean('is_active')
            : ($request->boolean('active_only') ? true : null);

        $paginator = $this->kategoriKegiatanService->list(
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $activeFilter,
        );

        return ApiResponse::success([
            'items' => KategoriKegiatanResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreKategoriKegiatanRequest $request): JsonResponse
    {
        return ApiResponse::success($this->kategoriKegiatanService->create($request->validated()), 'Kategori kegiatan berhasil ditambahkan', 201);
    }

    public function show(int $kategori_kegiatan): JsonResponse
    {
        return ApiResponse::success($this->kategoriKegiatanService->find($kategori_kegiatan));
    }

    public function update(UpdateKategoriKegiatanRequest $request, int $kategori_kegiatan): JsonResponse
    {
        return ApiResponse::success($this->kategoriKegiatanService->update($kategori_kegiatan, $request->validated()), 'Kategori kegiatan berhasil diperbarui');
    }

    public function destroy(int $kategori_kegiatan): JsonResponse
    {
        $this->kategoriKegiatanService->delete($kategori_kegiatan);

        return ApiResponse::success(null, 'Kategori kegiatan berhasil dihapus');
    }
}
