<?php

namespace App\Http\Controllers\Api;

use App\DTOs\KegiatanData;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKegiatanRequest;
use App\Http\Requests\UpdateKegiatanRequest;
use App\Http\Resources\KegiatanResource;
use App\Http\Responses\ApiResponse;
use App\Services\KegiatanService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KegiatanController extends Controller
{
    public function __construct(private readonly KegiatanService $kegiatanService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->kegiatanService->list(
            $request->query('q'),
            $request->query('status') ?: null,
            $request->query('date_from') ?: null,
            $request->query('date_to') ?: null,
            $request->filled('kategori_kegiatan_id') ? $request->integer('kategori_kegiatan_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => KegiatanResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreKegiatanRequest $request): JsonResponse
    {
        $kegiatan = $this->kegiatanService->create(KegiatanData::fromArray($request->validated()));

        return ApiResponse::success($kegiatan, 'Kegiatan berhasil ditambahkan', 201);
    }

    public function show(int $kegiatan): JsonResponse
    {
        return ApiResponse::success($this->kegiatanService->find($kegiatan));
    }

    public function update(UpdateKegiatanRequest $request, int $kegiatan): JsonResponse
    {
        $updated = $this->kegiatanService->updatePartial($kegiatan, $request->validated());

        return ApiResponse::success($updated, 'Kegiatan berhasil diperbarui');
    }

    public function destroy(int $kegiatan): JsonResponse
    {
        $this->kegiatanService->delete($kegiatan);

        return ApiResponse::success(null, 'Kegiatan berhasil dihapus');
    }
}
