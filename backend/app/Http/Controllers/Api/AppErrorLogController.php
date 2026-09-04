<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 13:52:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:46:40
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAppErrorLogRequest;
use App\Http\Resources\AppErrorLogResource;
use App\Http\Responses\ApiResponse;
use App\Services\AppErrorLogService;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppErrorLogController extends Controller
{
    public function __construct(
        private readonly AppErrorLogService $appErrorLogService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->appErrorLogService->list(
            $request->query('q'),
            $request->query('level'),
            $request->query('status'),
            $request->query('date_from'),
            $request->query('date_to'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success(
            PaginationHelper::envelope(
                $paginator,
                AppErrorLogResource::collection($paginator->items()),
            )
        );
    }

    public function show(int $id): JsonResponse
    {
        $log = $this->appErrorLogService->find($id);
        if (! $log) {
            return ApiResponse::error('Log error tidak ditemukan.', null, 404);
        }

        return ApiResponse::success(
            (new AppErrorLogResource($log))->additional(['include_trace' => true])->resolve()
        );
    }

    public function update(UpdateAppErrorLogRequest $request, int $id): JsonResponse
    {
        try {
            $log = $this->appErrorLogService->updateStatus($id, $request->validated(), $request->user());
        } catch (ModelNotFoundException) {
            return ApiResponse::error('Log error tidak ditemukan.', null, 404);
        }

        return ApiResponse::success(
            (new AppErrorLogResource($log))->additional(['include_trace' => true])->resolve(),
            'Status log diperbarui.'
        );
    }

    public function clear(Request $request): JsonResponse
    {
        $deleted = $this->appErrorLogService->clear(
            $request->query('level') ?? $request->input('level'),
            $request->query('status') ?? $request->input('status'),
            $request->query('date_from') ?? $request->input('date_from'),
            $request->query('date_to') ?? $request->input('date_to'),
        );

        return ApiResponse::success(
            ['deleted' => $deleted],
            $deleted > 0
                ? "Berhasil membersihkan {$deleted} log error."
                : 'Tidak ada log yang dihapus.'
        );
    }
}
