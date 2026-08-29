<?php

namespace App\Http\Controllers\Api;

use App\DTOs\PengajianData;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePengajianRequest;
use App\Http\Requests\UpdatePengajianRequest;
use App\Http\Resources\PengajianResource;
use App\Http\Responses\ApiResponse;
use App\Services\PengajianService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PengajianController extends Controller
{
    public function __construct(private readonly PengajianService $pengajianService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->pengajianService->list(
            $request->query('q'),
            $request->query('status') ?: null,
            $request->query('date_from') ?: null,
            $request->query('date_to') ?: null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => PengajianResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StorePengajianRequest $request): JsonResponse
    {
        $pengajian = $this->pengajianService->create(PengajianData::fromArray($request->validated()));

        return ApiResponse::success($pengajian, 'Pengajian berhasil ditambahkan', 201);
    }

    public function show(int $pengajian): JsonResponse
    {
        return ApiResponse::success($this->pengajianService->find($pengajian));
    }

    public function update(UpdatePengajianRequest $request, int $pengajian): JsonResponse
    {
        $updated = $this->pengajianService->updatePartial($pengajian, $request->validated());

        return ApiResponse::success($updated, 'Pengajian berhasil diperbarui');
    }

    public function destroy(int $pengajian): JsonResponse
    {
        $this->pengajianService->delete($pengajian);

        return ApiResponse::success(null, 'Pengajian berhasil dihapus');
    }
}
