<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:02:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:02:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdmKecamatanRequest;
use App\Http\Requests\UpdateAdmKecamatanRequest;
use App\Http\Resources\AdmKecamatanResource;
use App\Http\Responses\ApiResponse;
use App\Services\AdmKecamatanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdmKecamatanController extends Controller
{
    public function __construct(private readonly AdmKecamatanService $admKecamatanService) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->admKecamatanService->list(
            $request->query('q'),
            $request->filled('kabupaten_kota_id') ? $request->integer('kabupaten_kota_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
        );

        return ApiResponse::success([
            'items' => AdmKecamatanResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreAdmKecamatanRequest $request): JsonResponse
    {
        $kecamatan = $this->admKecamatanService->create($request->validated());

        return ApiResponse::success($kecamatan, 'Kecamatan berhasil ditambahkan', 201);
    }

    public function show(int $adm_kecamatan): JsonResponse
    {
        return ApiResponse::success($this->admKecamatanService->find($adm_kecamatan));
    }

    public function update(UpdateAdmKecamatanRequest $request, int $adm_kecamatan): JsonResponse
    {
        $updated = $this->admKecamatanService->update($adm_kecamatan, $request->validated());

        return ApiResponse::success($updated, 'Kecamatan berhasil diperbarui');
    }

    public function destroy(int $adm_kecamatan): JsonResponse
    {
        $this->admKecamatanService->delete($adm_kecamatan);

        return ApiResponse::success(null, 'Kecamatan berhasil dihapus');
    }
}
