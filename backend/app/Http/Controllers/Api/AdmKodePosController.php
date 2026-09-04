<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:03:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:03:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdmKodePosRequest;
use App\Http\Requests\UpdateAdmKodePosRequest;
use App\Http\Resources\AdmKodePosResource;
use App\Http\Responses\ApiResponse;
use App\Services\AdmKodePosService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdmKodePosController extends Controller
{
    public function __construct(private readonly AdmKodePosService $admKodePosService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->admKodePosService->list(
            $request->query('q'),
            $request->filled('wilayah_adm_desa_id') ? $request->integer('wilayah_adm_desa_id') : null,
            $request->filled('wilayah_adm_kecamatan_id') ? $request->integer('wilayah_adm_kecamatan_id') : null,
            $request->filled('wilayah_adm_kabupaten_kota_id') ? $request->integer('wilayah_adm_kabupaten_kota_id') : null,
            $request->filled('wilayah_adm_provinsi_id') ? $request->integer('wilayah_adm_provinsi_id') : null,
            $request->filled('wilayah_adm_negara_id') ? $request->integer('wilayah_adm_negara_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => AdmKodePosResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreAdmKodePosRequest $request): JsonResponse
    {
        $kodePos = $this->admKodePosService->create($request->validated());

        return ApiResponse::success($kodePos, 'Kode pos berhasil ditambahkan', 201);
    }

    public function show(int $wilayah_adm_kode_pos): JsonResponse
    {
        return ApiResponse::success($this->admKodePosService->find($wilayah_adm_kode_pos));
    }

    public function update(UpdateAdmKodePosRequest $request, int $wilayah_adm_kode_pos): JsonResponse
    {
        $updated = $this->admKodePosService->update($wilayah_adm_kode_pos, $request->validated());

        return ApiResponse::success($updated, 'Kode pos berhasil diperbarui');
    }

    public function destroy(int $wilayah_adm_kode_pos): JsonResponse
    {
        $this->admKodePosService->delete($wilayah_adm_kode_pos);

        return ApiResponse::success(null, 'Kode pos berhasil dihapus');
    }
}
