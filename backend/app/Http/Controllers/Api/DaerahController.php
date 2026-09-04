<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDaerahRequest;
use App\Http\Requests\UpdateDaerahRequest;
use App\Http\Resources\DaerahResource;
use App\Http\Responses\ApiResponse;
use App\Services\DaerahService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DaerahController extends Controller
{
    public function __construct(private readonly DaerahService $daerahService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->daerahService->list(
            $request->user(),
            $request->query('q'),
            $request->filled('wilayah_fung_pusat_id') ? $request->integer('wilayah_fung_pusat_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => DaerahResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreDaerahRequest $request): JsonResponse
    {
        $daerah = $this->daerahService->create($request->validated(), $request->user());

        return ApiResponse::success($daerah, 'Daerah berhasil ditambahkan', 201);
    }

    public function show(Request $request, int $wilayah_fung_daerah): JsonResponse
    {
        return ApiResponse::success($this->daerahService->find($wilayah_fung_daerah, $request->user()));
    }

    public function update(UpdateDaerahRequest $request, int $wilayah_fung_daerah): JsonResponse
    {
        $updated = $this->daerahService->update($wilayah_fung_daerah, $request->validated(), $request->user());

        return ApiResponse::success($updated, 'Daerah berhasil diperbarui');
    }

    public function destroy(Request $request, int $wilayah_fung_daerah): JsonResponse
    {
        $this->daerahService->delete($wilayah_fung_daerah, $request->user());

        return ApiResponse::success(null, 'Daerah berhasil dihapus');
    }
}
