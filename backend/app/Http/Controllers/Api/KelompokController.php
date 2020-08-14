<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKelompokRequest;
use App\Http\Requests\UpdateKelompokRequest;
use App\Http\Resources\KelompokResource;
use App\Http\Responses\ApiResponse;
use App\Services\KelompokService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KelompokController extends Controller
{
    public function __construct(private readonly KelompokService $kelompokService) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->kelompokService->list(
            $request->user(),
            $request->query('q'),
            $request->filled('desa_id') ? $request->integer('desa_id') : null,
            $request->filled('daerah_id') ? $request->integer('daerah_id') : null,
            $request->has('is_active') ? $request->boolean('is_active') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
        );

        return ApiResponse::success([
            'items' => KelompokResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreKelompokRequest $request): JsonResponse
    {
        $kelompok = $this->kelompokService->create($request->validated(), $request->user());

        return ApiResponse::success($kelompok, 'Kelompok berhasil ditambahkan', 201);
    }

    public function show(Request $request, int $kelompok): JsonResponse
    {
        return ApiResponse::success($this->kelompokService->find($kelompok, $request->user()));
    }

    public function update(UpdateKelompokRequest $request, int $kelompok): JsonResponse
    {
        $updated = $this->kelompokService->update($kelompok, $request->validated(), $request->user());

        return ApiResponse::success($updated, 'Kelompok berhasil diperbarui');
    }

    public function destroy(Request $request, int $kelompok): JsonResponse
    {
        $this->kelompokService->delete($kelompok, $request->user());

        return ApiResponse::success(null, 'Kelompok berhasil dihapus');
    }
}
