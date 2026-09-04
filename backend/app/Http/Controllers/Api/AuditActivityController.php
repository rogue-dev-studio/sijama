<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 14:10:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 14:10:53
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditActivityResource;
use App\Http\Responses\ApiResponse;
use App\Services\AuditActivityService;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditActivityController extends Controller
{
    public function __construct(
        private readonly AuditActivityService $auditActivityService,
    ) {}

    public function aksesIndex(Request $request): JsonResponse
    {
        return $this->index($request, AuditActivityService::MODULE_ACCESS);
    }

    public function aksesShow(int $id): JsonResponse
    {
        return $this->show(AuditActivityService::MODULE_ACCESS, $id);
    }

    public function konfigIndex(Request $request): JsonResponse
    {
        return $this->index($request, AuditActivityService::MODULE_KONFIG);
    }

    public function konfigShow(int $id): JsonResponse
    {
        return $this->show(AuditActivityService::MODULE_KONFIG, $id);
    }

    public function jamaahIndex(Request $request): JsonResponse
    {
        return $this->index($request, AuditActivityService::MODULE_JAMAAH);
    }

    public function jamaahShow(int $id): JsonResponse
    {
        return $this->show(AuditActivityService::MODULE_JAMAAH, $id);
    }

    private function index(Request $request, string $module): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->auditActivityService->list(
            $module,
            $request->query('q'),
            $request->query('action'),
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
                AuditActivityResource::collection($paginator->items()),
            )
        );
    }

    private function show(string $module, int $id): JsonResponse
    {
        $row = $this->auditActivityService->find($module, $id);
        if (! $row) {
            return ApiResponse::error('Audit tidak ditemukan.', null, 404);
        }

        return ApiResponse::success(
            (new AuditActivityResource($row))->additional(['include_meta' => true])->resolve()
        );
    }
}
