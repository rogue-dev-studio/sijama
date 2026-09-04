<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:20:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppReportRequest;
use App\Http\Requests\UpdateAppReportRequest;
use App\Http\Resources\AppReportResource;
use App\Http\Responses\ApiResponse;
use App\Services\AppReportService;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppReportController extends Controller
{
    public function __construct(
        private readonly AppReportService $appReportService,
    ) {}

    public function storeTeknis(StoreAppReportRequest $request): JsonResponse
    {
        return $this->store($request, 'teknis');
    }

    public function storeNonteknis(StoreAppReportRequest $request): JsonResponse
    {
        return $this->store($request, 'nonteknis');
    }

    public function mine(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->appReportService->listMine(
            $request->user(),
            $request->query('q'),
            $request->query('category'),
            $request->query('status'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success(
            PaginationHelper::envelope(
                $paginator,
                AppReportResource::collection($paginator->items()),
            )
        );
    }

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->appReportService->listAll(
            $request->query('q'),
            $request->query('category'),
            $request->query('status'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success(
            PaginationHelper::envelope(
                $paginator,
                AppReportResource::collection($paginator->items()),
            )
        );
    }

    public function update(UpdateAppReportRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();
        $report = $this->appReportService->updateStatus(
            $id,
            $data['status'],
            $data['admin_notes'] ?? null,
        );

        return ApiResponse::success(new AppReportResource($report), 'Status laporan diperbarui.');
    }

    private function store(StoreAppReportRequest $request, string $category): JsonResponse
    {
        $data = $request->safe()->except(['images']);
        $images = $request->file('images', []);
        if (! is_array($images) || $images === []) {
            $bag = $request->allFiles()['images'] ?? null;
            if (is_array($bag)) {
                $images = $bag;
            } elseif ($bag) {
                $images = [$bag];
            } else {
                $images = [];
            }
        }

        $report = $this->appReportService->store($category, $data, $request->user(), $images);

        return ApiResponse::success(new AppReportResource($report), 'Laporan berhasil dikirim.', 201);
    }
}
