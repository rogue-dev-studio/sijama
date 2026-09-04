<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:55:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppPollRequest;
use App\Http\Requests\UpdateAppPollRequest;
use App\Http\Requests\VoteAppPollRequest;
use App\Http\Resources\AppPollResource;
use App\Http\Responses\ApiResponse;
use App\Services\AppPollService;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppPollController extends Controller
{
    public function __construct(
        private readonly AppPollService $appPollService,
    ) {}

    public function active(Request $request): JsonResponse
    {
        $polls = $this->appPollService->listActive($request->user());

        return ApiResponse::success(AppPollResource::collection($polls));
    }

    public function vote(VoteAppPollRequest $request, int $id): JsonResponse
    {
        $vote = $this->appPollService->vote($id, (int) $request->validated('option_id'), $request->user());

        return ApiResponse::success([
            'id' => $vote->id,
            'poll_id' => $vote->poll_id,
            'option_id' => $vote->option_id,
            'user_id' => $vote->user_id,
            'created_at' => $vote->created_at?->toIso8601String(),
        ], 'Suara berhasil dikirim.', 201);
    }

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $isActive = null;
        if ($request->has('is_active')) {
            $isActive = filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }

        $paginator = $this->appPollService->listAdmin(
            $request->query('q'),
            $isActive,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success(
            PaginationHelper::envelope(
                $paginator,
                AppPollResource::collection($paginator->items()),
            )
        );
    }

    public function store(StoreAppPollRequest $request): JsonResponse
    {
        $poll = $this->appPollService->store($request->validated(), $request->user());

        return ApiResponse::success(new AppPollResource($poll), 'Polling berhasil dibuat.', 201);
    }

    public function update(UpdateAppPollRequest $request, int $id): JsonResponse
    {
        $poll = $this->appPollService->update($id, $request->validated());

        return ApiResponse::success(new AppPollResource($poll), 'Polling diperbarui.');
    }
}
