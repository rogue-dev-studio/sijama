<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:05:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:05:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdmProvinsiRequest;
use App\Http\Requests\UpdateAdmProvinsiRequest;
use App\Http\Resources\AdmProvinsiResource;
use App\Http\Responses\ApiResponse;
use App\Services\AdmProvinsiService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdmProvinsiController extends Controller
{
    public function __construct(private readonly AdmProvinsiService $admProvinsiService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->admProvinsiService->list(
            $request->query('q'),
            $request->filled('wilayah_adm_negara_id') ? $request->integer('wilayah_adm_negara_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => AdmProvinsiResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreAdmProvinsiRequest $request): JsonResponse
    {
        $provinsi = $this->admProvinsiService->create($request->validated());

        return ApiResponse::success($provinsi, 'Provinsi berhasil ditambahkan', 201);
    }

    public function show(int $wilayah_adm_provinsi): JsonResponse
    {
        return ApiResponse::success($this->admProvinsiService->find($wilayah_adm_provinsi));
    }

    public function update(UpdateAdmProvinsiRequest $request, int $wilayah_adm_provinsi): JsonResponse
    {
        $updated = $this->admProvinsiService->update($wilayah_adm_provinsi, $request->validated());

        return ApiResponse::success($updated, 'Provinsi berhasil diperbarui');
    }

    public function destroy(int $wilayah_adm_provinsi): JsonResponse
    {
        $this->admProvinsiService->delete($wilayah_adm_provinsi);

        return ApiResponse::success(null, 'Provinsi berhasil dihapus');
    }
}
