<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubKelompokRequest;
use App\Http\Requests\UpdateSubKelompokRequest;
use App\Http\Resources\SubKelompokResource;
use App\Http\Responses\ApiResponse;
use App\Services\SubKelompokService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubKelompokController extends Controller
{
    public function __construct(private readonly SubKelompokService $subKelompokService) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->subKelompokService->list(
            $request->user(),
            $request->query('q'),
            $request->filled('kelompok_id') ? $request->integer('kelompok_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
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

    public function show(Request $request, int $sub_kelompok): JsonResponse
    {
        return ApiResponse::success($this->subKelompokService->find($sub_kelompok, $request->user()));
    }

    public function update(UpdateSubKelompokRequest $request, int $sub_kelompok): JsonResponse
    {
        $updated = $this->subKelompokService->update($sub_kelompok, $request->validated(), $request->user());

        return ApiResponse::success($updated, 'Sub kelompok berhasil diperbarui');
    }

    public function destroy(Request $request, int $sub_kelompok): JsonResponse
    {
        $this->subKelompokService->delete($sub_kelompok, $request->user());

        return ApiResponse::success(null, 'Sub kelompok berhasil dihapus');
    }
}
