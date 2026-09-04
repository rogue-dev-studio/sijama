<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMasterUserRequest;
use App\Http\Requests\UpdateMasterUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Responses\ApiResponse;
use App\Services\MasterUserService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MasterUserController extends Controller
{
    public function __construct(private readonly MasterUserService $masterUserService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->masterUserService->list(
            $request->query('q'),
            $request->has('is_active') ? $request->boolean('is_active') : null,
            $request->filled('dapukan_id') ? $request->integer('dapukan_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
            $request->user(),
        );

        return ApiResponse::success([
            'items' => UserResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreMasterUserRequest $request): JsonResponse
    {
        $user = $this->masterUserService->create($request->validated(), $request->user());

        return ApiResponse::success($user, 'Pengguna berhasil ditambahkan', 201);
    }

    public function show(Request $request, int $user): JsonResponse
    {
        return ApiResponse::success($this->masterUserService->find($user, $request->user()));
    }

    public function update(UpdateMasterUserRequest $request, int $user): JsonResponse
    {
        $updated = $this->masterUserService->update($user, $request->validated(), $request->user());

        return ApiResponse::success($updated, 'Pengguna berhasil diperbarui');
    }

    public function deactivate(Request $request, int $user): JsonResponse
    {
        $updated = $this->masterUserService->deactivate($user, $request->user());

        return ApiResponse::success($updated, 'Pengguna berhasil dinonaktifkan');
    }
}
