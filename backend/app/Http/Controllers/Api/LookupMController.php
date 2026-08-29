<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:23:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:23:49
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLookupMRequest;
use App\Http\Requests\UpdateLookupMRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\LookupMResource;
use App\Services\LookupMService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LookupMController extends Controller
{
    public function __construct(private readonly LookupMService $lookupMService) {}

    public function index(Request $request): JsonResponse
    {
        $activeFilter = $request->has('is_active')
            ? $request->boolean('is_active')
            : ($request->boolean('active_only') ? true : null);

        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->lookupMService->list(
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $activeFilter,
            [
                'lookup_type' => $request->query('lookup_type'),
            ],
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => LookupMResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreLookupMRequest $request): JsonResponse
    {
        return ApiResponse::success(
            $this->lookupMService->create($request->validated()),
            'Lookup berhasil ditambahkan',
            201,
        );
    }

    public function show(int $lookup): JsonResponse
    {
        return ApiResponse::success($this->lookupMService->find($lookup));
    }

    public function update(UpdateLookupMRequest $request, int $lookup): JsonResponse
    {
        return ApiResponse::success(
            $this->lookupMService->update($lookup, $request->validated()),
            'Lookup berhasil diperbarui',
        );
    }

    public function destroy(int $lookup): JsonResponse
    {
        $this->lookupMService->delete($lookup);

        return ApiResponse::success(null, 'Lookup berhasil dihapus');
    }
}
