<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePemateriRequest;
use App\Http\Requests\UpdatePemateriRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\PemateriResource;
use App\Services\PemateriService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PemateriController extends Controller
{
    public function __construct(private readonly PemateriService $pemateriService) {}

    public function index(Request $request): JsonResponse
    {
        $activeFilter = $request->has('is_active')
            ? $request->boolean('is_active')
            : ($request->boolean('active_only') ? true : null);

        $paginator = $this->pemateriService->list(
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $activeFilter,
        );

        return ApiResponse::success([
            'items' => PemateriResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StorePemateriRequest $request): JsonResponse
    {
        return ApiResponse::success($this->pemateriService->create($request->validated()), 'Pemateri berhasil ditambahkan', 201);
    }

    public function show(int $pemateri): JsonResponse
    {
        return ApiResponse::success($this->pemateriService->find($pemateri));
    }

    public function update(UpdatePemateriRequest $request, int $pemateri): JsonResponse
    {
        return ApiResponse::success($this->pemateriService->update($pemateri, $request->validated()), 'Pemateri berhasil diperbarui');
    }

    public function destroy(int $pemateri): JsonResponse
    {
        $this->pemateriService->delete($pemateri);

        return ApiResponse::success(null, 'Pemateri berhasil dihapus');
    }
}
