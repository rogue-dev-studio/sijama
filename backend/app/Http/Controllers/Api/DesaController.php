<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDesaRequest;
use App\Http\Requests\UpdateDesaRequest;
use App\Http\Resources\DesaResource;
use App\Http\Responses\ApiResponse;
use App\Services\DesaService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DesaController extends Controller
{
    public function __construct(private readonly DesaService $desaService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->desaService->list(
            $request->user(),
            $request->query('q'),
            $request->filled('wilayah_fung_daerah_id') ? $request->integer('wilayah_fung_daerah_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => DesaResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreDesaRequest $request): JsonResponse
    {
        $desa = $this->desaService->create($request->validated(), $request->user());

        return ApiResponse::success($desa, 'Desa berhasil ditambahkan', 201);
    }

    public function show(Request $request, int $wilayah_fung_desa): JsonResponse
    {
        return ApiResponse::success($this->desaService->find($wilayah_fung_desa, $request->user()));
    }

    public function update(UpdateDesaRequest $request, int $wilayah_fung_desa): JsonResponse
    {
        $updated = $this->desaService->update($wilayah_fung_desa, $request->validated(), $request->user());

        return ApiResponse::success($updated, 'Desa berhasil diperbarui');
    }

    public function destroy(Request $request, int $wilayah_fung_desa): JsonResponse
    {
        $this->desaService->delete($wilayah_fung_desa, $request->user());

        return ApiResponse::success(null, 'Desa berhasil dihapus');
    }
}
