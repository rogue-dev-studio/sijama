<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubKelompokRequest;
use App\Http\Requests\UpdateSubKelompokRequest;
use App\Http\Resources\SubKelompokResource;
use App\Http\Responses\ApiResponse;
use App\Services\SubKelompokService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubKelompokController extends Controller
{
    public function __construct(private readonly SubKelompokService $subKelompokService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->subKelompokService->list(
            $request->user(),
            $request->query('q'),
            $request->filled('wilayah_fung_kelompok_id') ? $request->integer('wilayah_fung_kelompok_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => SubKelompokResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreSubKelompokRequest $request): JsonResponse
    {
        $item = $this->subKelompokService->create($request->validated(), $request->user());

        return ApiResponse::success($item, 'Sub kelompok berhasil ditambahkan', 201);
    }

    public function show(Request $request, int $wilayah_fung_sub_kelompok): JsonResponse
    {
        return ApiResponse::success($this->subKelompokService->find($wilayah_fung_sub_kelompok, $request->user()));
    }

    public function update(UpdateSubKelompokRequest $request, int $wilayah_fung_sub_kelompok): JsonResponse
    {
        $updated = $this->subKelompokService->update($wilayah_fung_sub_kelompok, $request->validated(), $request->user());

        return ApiResponse::success($updated, 'Sub kelompok berhasil diperbarui');
    }

    public function destroy(Request $request, int $wilayah_fung_sub_kelompok): JsonResponse
    {
        $this->subKelompokService->delete($wilayah_fung_sub_kelompok, $request->user());

        return ApiResponse::success(null, 'Sub kelompok berhasil dihapus');
    }
}
