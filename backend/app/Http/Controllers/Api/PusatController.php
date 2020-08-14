<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:06:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:06:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePusatRequest;
use App\Http\Requests\UpdatePusatRequest;
use App\Http\Resources\PusatResource;
use App\Http\Responses\ApiResponse;
use App\Services\PusatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PusatController extends Controller
{
    public function __construct(private readonly PusatService $pusatService) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->pusatService->list(
            $request->user(),
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
        );

        return ApiResponse::success([
            'items' => PusatResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StorePusatRequest $request): JsonResponse
    {
        $pusat = $this->pusatService->create($request->validated());

        return ApiResponse::success($pusat, 'Pusat berhasil ditambahkan', 201);
    }

    public function show(Request $request, int $pusat): JsonResponse
    {
        return ApiResponse::success($this->pusatService->find($pusat, $request->user()));
    }

    public function update(UpdatePusatRequest $request, int $pusat): JsonResponse
    {
        $updated = $this->pusatService->update($pusat, $request->validated(), $request->user());

        return ApiResponse::success($updated, 'Pusat berhasil diperbarui');
    }

    public function destroy(Request $request, int $pusat): JsonResponse
    {
        $this->pusatService->delete($pusat, $request->user());

        return ApiResponse::success(null, 'Pusat berhasil dihapus');
    }
}
