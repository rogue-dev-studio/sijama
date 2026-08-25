<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResolveMapsLocationRequest;
use App\Http\Requests\SearchMapsPlacesRequest;
use App\Http\Requests\StoreLokasiRequest;
use App\Http\Requests\UpdateLokasiRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\LokasiResource;
use App\Services\LokasiService;
use App\Services\MapsLocationResolverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class LokasiController extends Controller
{
    public function __construct(
        private readonly LokasiService $lokasiService,
        private readonly MapsLocationResolverService $mapsLocationResolver,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $activeFilter = $request->has('is_active')
            ? $request->boolean('is_active')
            : ($request->boolean('active_only') ? true : null);

        $paginator = $this->lokasiService->list(
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $activeFilter,
            ['jenis' => $request->query('jenis')],
        );

        return ApiResponse::success([
            'items' => LokasiResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreLokasiRequest $request): JsonResponse
    {
        return ApiResponse::success($this->lokasiService->create($request->validated()), 'Lokasi berhasil ditambahkan', 201);
    }

    public function show(int $lokasi): JsonResponse
    {
        return ApiResponse::success($this->lokasiService->find($lokasi));
    }

    public function update(UpdateLokasiRequest $request, int $lokasi): JsonResponse
    {
        return ApiResponse::success($this->lokasiService->update($lokasi, $request->validated()), 'Lokasi berhasil diperbarui');
    }

    public function destroy(int $lokasi): JsonResponse
    {
        $this->lokasiService->delete($lokasi);

        return ApiResponse::success(null, 'Lokasi berhasil dihapus');
    }

    public function resolveLocation(ResolveMapsLocationRequest $request): JsonResponse
    {
        try {
            return ApiResponse::success(
                $this->mapsLocationResolver->resolve($request->validated('input')),
                'Koordinat berhasil ditemukan',
            );
        } catch (RuntimeException $exception) {
            return ApiResponse::error($exception->getMessage(), null, 422);
        }
    }

    public function searchPlaces(SearchMapsPlacesRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            return ApiResponse::success([
                'items' => $this->mapsLocationResolver->searchPlaces(
                    $validated['q'],
                    isset($validated['limit']) ? (int) $validated['limit'] : 6,
                ),
            ]);
        } catch (RuntimeException $exception) {
            return ApiResponse::error($exception->getMessage(), null, 502);
        }
    }
}
