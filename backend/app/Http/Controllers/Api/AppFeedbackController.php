<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:20:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppFeedbackRequest;
use App\Http\Requests\UpdateAppFeedbackRequest;
use App\Http\Requests\UpdateAppTestimonialVisibilityRequest;
use App\Http\Resources\AppFeedbackResource;
use App\Http\Responses\ApiResponse;
use App\Services\AppFeedbackService;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AppFeedbackController extends Controller
{
    public function __construct(
        private readonly AppFeedbackService $appFeedbackService,
    ) {}

    public function storeIde(StoreAppFeedbackRequest $request): JsonResponse
    {
        return $this->store($request, 'idea');
    }

    public function storeTestimoni(StoreAppFeedbackRequest $request): JsonResponse
    {
        return $this->store($request, 'testimonial');
    }

    public function published(): JsonResponse
    {
        $rows = $this->appFeedbackService->listPublishedTestimonials();

        return ApiResponse::success(AppFeedbackResource::collection($rows));
    }

    public function mine(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->appFeedbackService->listMine(
            $request->user(),
            'idea',
            $request->query('q'),
            $request->query('status'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success(
            PaginationHelper::envelope(
                $paginator,
                AppFeedbackResource::collection($paginator->items()),
            )
        );
    }

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $isPublished = null;
        if ($request->has('is_published')) {
            $isPublished = filter_var($request->query('is_published'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }

        $paginator = $this->appFeedbackService->listAdmin(
            $request->query('kind'),
            $request->query('q'),
            $request->query('status'),
            $isPublished,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success(
            PaginationHelper::envelope(
                $paginator,
                AppFeedbackResource::collection($paginator->items()),
            )
        );
    }

    public function update(UpdateAppFeedbackRequest $request, int $id): JsonResponse
    {
        $feedback = $this->appFeedbackService->updateAdmin($id, $request->validated());

        return ApiResponse::success(new AppFeedbackResource($feedback), 'Masukan diperbarui.');
    }

    public function indexTestimonials(Request $request): JsonResponse
    {
        $request->merge(['kind' => 'testimonial']);

        return $this->index($request);
    }

    public function updateTestimonial(UpdateAppTestimonialVisibilityRequest $request, int $id): JsonResponse
    {
        $existing = $this->appFeedbackService->findById($id);
        if (! $existing || $existing->kind !== 'testimonial') {
            throw new NotFoundHttpException('Testimoni tidak ditemukan.');
        }

        $feedback = $this->appFeedbackService->updateAdmin($id, $request->validated());

        return ApiResponse::success(new AppFeedbackResource($feedback), 'Tampilan testimoni diperbarui.');
    }

    private function store(StoreAppFeedbackRequest $request, string $kind): JsonResponse
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

        $feedback = $this->appFeedbackService->store($kind, $data, $request->user(), $images);
        $message = $kind === 'testimonial'
            ? 'Testimoni berhasil dikirim dan tampil di galeri.'
            : 'Masukan berhasil dikirim.';

        return ApiResponse::success(new AppFeedbackResource($feedback), $message, 201);
    }
}
