<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:01:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:01:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdmKabupatenKotaRequest;
use App\Http\Requests\UpdateAdmKabupatenKotaRequest;
use App\Http\Resources\AdmKabupatenKotaResource;
use App\Http\Responses\ApiResponse;
use App\Services\AdmKabupatenKotaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdmKabupatenKotaController extends Controller
{
    public function __construct(private readonly AdmKabupatenKotaService $admKabupatenKotaService) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->admKabupatenKotaService->list(
            $request->query('q'),
            $request->filled('provinsi_id') ? $request->integer('provinsi_id') : null,
            $request->query('jenis') ?: null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
        );

        return ApiResponse::success([
            'items' => AdmKabupatenKotaResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreAdmKabupatenKotaRequest $request): JsonResponse
    {
        $kabupatenKota = $this->admKabupatenKotaService->create($request->validated());

        return ApiResponse::success($kabupatenKota, 'Kabupaten/kota berhasil ditambahkan', 201);
    }

    public function show(int $adm_kabupaten_kota): JsonResponse
    {
        return ApiResponse::success($this->admKabupatenKotaService->find($adm_kabupaten_kota));
    }

    public function update(UpdateAdmKabupatenKotaRequest $request, int $adm_kabupaten_kota): JsonResponse
    {
        $updated = $this->admKabupatenKotaService->update($adm_kabupaten_kota, $request->validated());

        return ApiResponse::success($updated, 'Kabupaten/kota berhasil diperbarui');
    }

    public function destroy(int $adm_kabupaten_kota): JsonResponse
    {
        $this->admKabupatenKotaService->delete($adm_kabupaten_kota);

        return ApiResponse::success(null, 'Kabupaten/kota berhasil dihapus');
    }
}
