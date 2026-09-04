<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 13:41:46
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 13:41:46
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLoginResource;
use App\Http\Responses\ApiResponse;
use App\Services\AuditLoginService;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLoginController extends Controller
{
    public function __construct(
        private readonly AuditLoginService $auditLoginService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $successRaw = $request->query('success');
        $success = null;
        if ($successRaw === '1' || $successRaw === 'true') {
            $success = true;
        } elseif ($successRaw === '0' || $successRaw === 'false') {
            $success = false;
        }

        $paginator = $this->auditLoginService->list(
            $request->query('q'),
            $request->query('event'),
            $success,
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
                AuditLoginResource::collection($paginator->items()),
            )
        );
    }
}
