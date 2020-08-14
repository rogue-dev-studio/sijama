<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:06:41
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:06:41
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePekerjaanRequest;
use App\Http\Requests\UpdatePekerjaanRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\PekerjaanResource;
use App\Services\PekerjaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PekerjaanController extends Controller
{
    public function __construct(private readonly PekerjaanService $pekerjaanService) {}

    public function index(Request $request): JsonResponse
    {
        $activeFilter = $request->has('is_active')
            ? $request->boolean('is_active')
            : ($request->boolean('active_only') ? true : null);

        $paginator = $this->pekerjaanService->list(
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $activeFilter,
        );

        return ApiResponse::success([
            'items' => PekerjaanResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StorePekerjaanRequest $request): JsonResponse
    {
        return ApiResponse::success($this->pekerjaanService->create($request->validated()), 'Pekerjaan berhasil ditambahkan', 201);
    }

    public function show(int $pekerjaan): JsonResponse
    {
        return ApiResponse::success($this->pekerjaanService->find($pekerjaan));
    }

    public function update(UpdatePekerjaanRequest $request, int $pekerjaan): JsonResponse
    {
        return ApiResponse::success($this->pekerjaanService->update($pekerjaan, $request->validated()), 'Pekerjaan berhasil diperbarui');
    }

    public function destroy(int $pekerjaan): JsonResponse
    {
        $this->pekerjaanService->delete($pekerjaan);

        return ApiResponse::success(null, 'Pekerjaan berhasil dihapus');
    }
}
