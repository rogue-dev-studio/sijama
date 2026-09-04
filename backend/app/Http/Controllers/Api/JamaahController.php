<?php

namespace App\Http\Controllers\Api;

use App\DTOs\JamaahData;
use App\Http\Controllers\Controller;
use App\Http\Requests\EnrollFaceRequest;
use App\Http\Requests\StoreJamaahRequest;
use App\Http\Requests\UpdateJamaahRequest;
use App\Http\Resources\JamaahResource;
use App\Http\Responses\ApiResponse;
use App\Services\DapukanService;
use App\Services\JamaahService;
use App\Services\KelompokService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JamaahController extends Controller
{
    public function __construct(
        private readonly JamaahService $jamaahService,
        private readonly DapukanService $dapukanService,
        private readonly KelompokService $kelompokService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->jamaahService->list(
            $request->user(),
            $request->query('q'),
            $request->boolean('enrolled'),
            $request->query('status') ?: null,
            $request->filled('wilayah_fung_kelompok_id') ? $request->integer('wilayah_fung_kelompok_id') : null,
            $request->query('face') ?: null,
            $request->query('kategori_umur') ?: null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => JamaahResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function dapukanOptions(Request $request): JsonResponse
    {
        return ApiResponse::success(
            $this->dapukanService->listForJamaahForm($request->user())
        );
    }

    public function kelompokOptions(Request $request): JsonResponse
    {
        return ApiResponse::success(
            $this->kelompokService->listForJamaahForm($request->user())
        );
    }

    public function store(StoreJamaahRequest $request): JsonResponse
    {
        $jamaah = $this->jamaahService->create(
            JamaahData::fromArray($request->validated()),
            $request->user()
        );

        return ApiResponse::success($jamaah, 'Jamaah berhasil ditambahkan', 201);
    }

    public function show(Request $request, int $jamaah): JsonResponse
    {
        return ApiResponse::success($this->jamaahService->find($jamaah, $request->user()));
    }

    public function update(UpdateJamaahRequest $request, int $jamaah): JsonResponse
    {
        $updated = $this->jamaahService->updatePartial(
            $jamaah,
            $request->validated(),
            $request->user()
        );

        return ApiResponse::success($updated, 'Jamaah berhasil diperbarui');
    }

    public function destroy(Request $request, int $jamaah): JsonResponse
    {
        $this->jamaahService->delete($jamaah, $request->user());

        return ApiResponse::success(null, 'Jamaah berhasil dihapus');
    }

    public function enrollFace(EnrollFaceRequest $request, int $jamaah): JsonResponse
    {
        $result = $this->jamaahService->enrollFace(
            $jamaah,
            $request->validated('face_descriptor'),
            $request->user()
        );

        return ApiResponse::success($result, 'Face descriptor berhasil disimpan');
    }

    public function resetFace(Request $request, int $jamaah): JsonResponse
    {
        $result = $this->jamaahService->resetFace($jamaah, $request->user());

        return ApiResponse::success($result, 'Data wajah berhasil direset');
    }
}
