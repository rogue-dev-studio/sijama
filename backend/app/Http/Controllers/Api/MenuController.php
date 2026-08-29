<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuRequest;
use App\Http\Requests\UpdateMenuRequest;
use App\Http\Resources\MenuResource;
use App\Http\Responses\ApiResponse;
use App\Services\MenuService;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function __construct(private readonly MenuService $menuService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->menuService->list(
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success(
            PaginationHelper::envelope($paginator, MenuResource::collection($paginator->items()))
        );
    }

    public function store(StoreMenuRequest $request): JsonResponse
    {
        $menu = $this->menuService->create($request->validated());

        return ApiResponse::success($menu, 'Menu berhasil ditambahkan', 201);
    }

    public function show(int $menu): JsonResponse
    {
        return ApiResponse::success($this->menuService->find($menu));
    }

    public function update(UpdateMenuRequest $request, int $menu): JsonResponse
    {
        $updated = $this->menuService->update($menu, $request->validated());

        return ApiResponse::success($updated, 'Menu berhasil diperbarui');
    }

    public function destroy(int $menu): JsonResponse
    {
        $this->menuService->delete($menu);

        return ApiResponse::success(null, 'Menu berhasil dihapus');
    }
}
