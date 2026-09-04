<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 15:51:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:20:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIntegrationLogRequest;
use App\Http\Resources\IntegrationLogResource;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use App\Services\IntegrationLogService;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationLogController extends Controller
{
    public function __construct(
        private readonly IntegrationLogService $integrationLogService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $provider = $request->query('provider');
        if (! $this->canViewProvider($request->user(), is_string($provider) ? $provider : null)) {
            return ApiResponse::error('Akses ditolak.', null, 403);
        }

        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->integrationLogService->list(
            $request->query('q'),
            is_string($provider) ? $provider : null,
            $request->query('level'),
            $request->query('event_type'),
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
                IntegrationLogResource::collection($paginator->items()),
            )
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $row = $this->integrationLogService->find($id);
        if (! $this->canViewProvider($request->user(), $row->provider)) {
            return ApiResponse::error('Akses ditolak.', null, 403);
        }

        return ApiResponse::success(new IntegrationLogResource($row));
    }

    public function store(StoreIntegrationLogRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (! $this->canViewProvider($request->user(), $data['provider'])) {
            return ApiResponse::error('Akses ditolak.', null, 403);
        }

        $log = $this->integrationLogService->record(
            $data['provider'],
            $data['level'] ?? 'warning',
            $data['event_type'],
            $data['title'],
            $data['message'],
            $data['context'] ?? null,
        );

        return ApiResponse::success(new IntegrationLogResource($log), 'Log integrasi dicatat.');
    }

    public function check(Request $request, string $provider): JsonResponse
    {
        if (! $this->canViewProvider($request->user(), $provider)) {
            return ApiResponse::error('Akses ditolak.', null, 403);
        }

        $result = $this->integrationLogService->checkConnectivity($provider);

        return ApiResponse::success($result, $result['message']);
    }

    public function sweepExpiry(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user?->isSuperAdmin() && ! $user?->hasPermission('konfig.update')) {
            return ApiResponse::error('Akses ditolak.', null, 403);
        }

        $result = $this->integrationLogService->runExpirySweep();

        return ApiResponse::success($result, 'Pemeriksaan masa berlaku selesai.');
    }

    private function canViewProvider(?User $user, ?string $provider): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->isSuperAdmin() || $user->hasPermission('konfig.view') || $user->hasPermission('konfig.update')) {
            return true;
        }

        if (filled($provider)) {
            $slug = IntegrationLogService::PROVIDER_PERMISSIONS[$provider] ?? null;

            return $slug !== null && $user->hasPermission($slug);
        }

        foreach (IntegrationLogService::PROVIDER_PERMISSIONS as $slug) {
            if ($user->hasPermission($slug)) {
                return true;
            }
        }

        return false;
    }
}
