<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDapukanRequest;
use App\Http\Requests\UpdateDapukanRequest;
use App\Http\Resources\DapukanResource;
use App\Http\Responses\ApiResponse;
use App\Services\DapukanService;
use App\Support\PaginationHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DapukanController extends Controller
{
    public function __construct(private readonly DapukanService $dapukanService) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->dapukanService->list(
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
        );

        return ApiResponse::success(
            PaginationHelper::envelope($paginator, DapukanResource::collection($paginator->items()))
        );
    }

    public function store(StoreDapukanRequest $request): JsonResponse
    {
        $dapukan = $this->dapukanService->create($request->validated());

        return ApiResponse::success($dapukan, 'Dapukan berhasil ditambahkan', 201);
    }

    public function show(int $dapukan): JsonResponse
    {
        return ApiResponse::success($this->dapukanService->find($dapukan));
    }

    public function update(UpdateDapukanRequest $request, int $dapukan): JsonResponse
    {
        $updated = $this->dapukanService->update($dapukan, $request->validated());

        return ApiResponse::success($updated, 'Dapukan berhasil diperbarui');
    }

    public function destroy(int $dapukan): JsonResponse
    {
        $this->dapukanService->delete($dapukan);

        return ApiResponse::success(null, 'Dapukan berhasil dihapus');
    }
}
