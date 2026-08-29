<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHakAksesRequest;
use App\Http\Requests\UpdateHakAksesRequest;
use App\Http\Resources\HakAksesResource;
use App\Http\Responses\ApiResponse;
use App\Services\HakAksesService;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HakAksesController extends Controller
{
    public function __construct(private readonly HakAksesService $hakAksesService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->hakAksesService->list(
            $request->query('q'),
            $request->filled('fitur_id') ? $request->integer('fitur_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success(
            PaginationHelper::envelope($paginator, HakAksesResource::collection($paginator->items()))
        );
    }

    public function store(StoreHakAksesRequest $request): JsonResponse
    {
        $hakAkses = $this->hakAksesService->create($request->validated());

        return ApiResponse::success($hakAkses, 'Hak akses berhasil ditambahkan', 201);
    }

    public function show(int $hak_akses): JsonResponse
    {
        return ApiResponse::success($this->hakAksesService->find($hak_akses));
    }

    public function update(UpdateHakAksesRequest $request, int $hak_akses): JsonResponse
    {
        $updated = $this->hakAksesService->update($hak_akses, $request->validated());

        return ApiResponse::success($updated, 'Hak akses berhasil diperbarui');
    }

    public function destroy(int $hak_akses): JsonResponse
    {
        $this->hakAksesService->delete($hak_akses);

        return ApiResponse::success(null, 'Hak akses berhasil dihapus');
    }
}
