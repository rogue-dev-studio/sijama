<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFiturRequest;
use App\Http\Requests\UpdateFiturRequest;
use App\Http\Resources\FiturResource;
use App\Http\Responses\ApiResponse;
use App\Services\FiturService;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FiturController extends Controller
{
    public function __construct(private readonly FiturService $fiturService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->fiturService->list(
            $request->query('q'),
            $request->filled('menu_id') ? $request->integer('menu_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success(
            PaginationHelper::envelope($paginator, FiturResource::collection($paginator->items()))
        );
    }

    public function store(StoreFiturRequest $request): JsonResponse
    {
        $fitur = $this->fiturService->create($request->validated());

        return ApiResponse::success($fitur, 'Fitur berhasil ditambahkan', 201);
    }

    public function show(int $fitur): JsonResponse
    {
        return ApiResponse::success($this->fiturService->find($fitur));
    }

    public function update(UpdateFiturRequest $request, int $fitur): JsonResponse
    {
        $updated = $this->fiturService->update($fitur, $request->validated());

        return ApiResponse::success($updated, 'Fitur berhasil diperbarui');
    }

    public function destroy(int $fitur): JsonResponse
    {
        $this->fiturService->delete($fitur);

        return ApiResponse::success(null, 'Fitur berhasil dihapus');
    }
}
