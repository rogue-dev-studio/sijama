<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMateriRequest;
use App\Http\Requests\UpdateMateriRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\MateriResource;
use App\Services\MateriService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MateriController extends Controller
{
    public function __construct(private readonly MateriService $materiService) {}

    public function index(Request $request): JsonResponse
    {
        $activeFilter = $request->has('is_active')
            ? $request->boolean('is_active')
            : ($request->boolean('active_only') ? true : null);

        $paginator = $this->materiService->list(
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $activeFilter,
        );

        return ApiResponse::success([
            'items' => MateriResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreMateriRequest $request): JsonResponse
    {
        return ApiResponse::success($this->materiService->create($request->validated()), 'Materi berhasil ditambahkan', 201);
    }

    public function show(int $materi): JsonResponse
    {
        return ApiResponse::success($this->materiService->find($materi));
    }

    public function update(UpdateMateriRequest $request, int $materi): JsonResponse
    {
        return ApiResponse::success($this->materiService->update($materi, $request->validated()), 'Materi berhasil diperbarui');
    }

    public function destroy(int $materi): JsonResponse
    {
        $this->materiService->delete($materi);

        return ApiResponse::success(null, 'Materi berhasil dihapus');
    }
}
