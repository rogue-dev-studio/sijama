<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:00:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:00:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdmDesaKelurahanRequest;
use App\Http\Requests\UpdateAdmDesaKelurahanRequest;
use App\Http\Resources\AdmDesaKelurahanResource;
use App\Http\Responses\ApiResponse;
use App\Services\AdmDesaKelurahanService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdmDesaKelurahanController extends Controller
{
    public function __construct(private readonly AdmDesaKelurahanService $admDesaKelurahanService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->admDesaKelurahanService->list(
            $request->query('q'),
            $request->filled('kecamatan_id') ? $request->integer('kecamatan_id') : null,
            $request->query('jenis') ?: null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => AdmDesaKelurahanResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreAdmDesaKelurahanRequest $request): JsonResponse
    {
        $desaKelurahan = $this->admDesaKelurahanService->create($request->validated());

        return ApiResponse::success($desaKelurahan, 'Desa/kelurahan berhasil ditambahkan', 201);
    }

    public function show(int $adm_desa_kelurahan): JsonResponse
    {
        return ApiResponse::success($this->admDesaKelurahanService->find($adm_desa_kelurahan));
    }

    public function update(UpdateAdmDesaKelurahanRequest $request, int $adm_desa_kelurahan): JsonResponse
    {
        $updated = $this->admDesaKelurahanService->update($adm_desa_kelurahan, $request->validated());

        return ApiResponse::success($updated, 'Desa/kelurahan berhasil diperbarui');
    }

    public function destroy(int $adm_desa_kelurahan): JsonResponse
    {
        $this->admDesaKelurahanService->delete($adm_desa_kelurahan);

        return ApiResponse::success(null, 'Desa/kelurahan berhasil dihapus');
    }
}
