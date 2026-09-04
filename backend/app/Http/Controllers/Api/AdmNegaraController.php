<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:04:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:04:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdmNegaraRequest;
use App\Http\Requests\UpdateAdmNegaraRequest;
use App\Http\Resources\AdmNegaraResource;
use App\Http\Responses\ApiResponse;
use App\Services\AdmNegaraService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdmNegaraController extends Controller
{
    public function __construct(private readonly AdmNegaraService $admNegaraService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->admNegaraService->list(
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => AdmNegaraResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreAdmNegaraRequest $request): JsonResponse
    {
        $negara = $this->admNegaraService->create($request->validated());

        return ApiResponse::success($negara, 'Negara berhasil ditambahkan', 201);
    }

    public function show(int $wilayah_adm_negara): JsonResponse
    {
        return ApiResponse::success($this->admNegaraService->find($wilayah_adm_negara));
    }

    public function update(UpdateAdmNegaraRequest $request, int $wilayah_adm_negara): JsonResponse
    {
        $updated = $this->admNegaraService->update($wilayah_adm_negara, $request->validated());

        return ApiResponse::success($updated, 'Negara berhasil diperbarui');
    }

    public function destroy(int $wilayah_adm_negara): JsonResponse
    {
        $this->admNegaraService->delete($wilayah_adm_negara);

        return ApiResponse::success(null, 'Negara berhasil dihapus');
    }
}
