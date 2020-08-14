<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDaerahRequest;
use App\Http\Requests\UpdateDaerahRequest;
use App\Http\Resources\DaerahResource;
use App\Http\Responses\ApiResponse;
use App\Services\DaerahService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DaerahController extends Controller
{
    public function __construct(private readonly DaerahService $daerahService) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->daerahService->list(
            $request->user(),
            $request->query('q'),
            $request->filled('pusat_id') ? $request->integer('pusat_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
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

    public function show(Request $request, int $daerah): JsonResponse
    {
        return ApiResponse::success($this->daerahService->find($daerah, $request->user()));
    }

    public function update(UpdateDaerahRequest $request, int $daerah): JsonResponse
    {
        $updated = $this->daerahService->update($daerah, $request->validated(), $request->user());

        return ApiResponse::success($updated, 'Daerah berhasil diperbarui');
    }

    public function destroy(Request $request, int $daerah): JsonResponse
    {
        $this->daerahService->delete($daerah, $request->user());

        return ApiResponse::success(null, 'Daerah berhasil dihapus');
    }
}
