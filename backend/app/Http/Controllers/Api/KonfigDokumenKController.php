<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:52:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:14:05
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateKonfigDokumenKRequest;
use App\Http\Requests\UploadKonfigDokumenAssetRequest;
use App\Http\Responses\ApiResponse;
use App\Services\KonfigDokumenKService;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KonfigDokumenKController extends Controller
{
    public function __construct(private readonly KonfigDokumenKService $konfigDokumenKService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->konfigDokumenKService->list(
            $request->query('q'),
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success(PaginationHelper::envelope(
            $paginator,
            $this->konfigDokumenKService->mapPage($paginator),
        ));
    }

    public function show(int $lookupId): JsonResponse
    {
        return ApiResponse::success($this->konfigDokumenKService->show($lookupId));
    }

    public function update(UpdateKonfigDokumenKRequest $request): JsonResponse
    {
        return ApiResponse::success(
            $this->konfigDokumenKService->upsert($request->validated()),
            'Konfigurasi dokumen berhasil disimpan',
        );
    }

    public function uploadAsset(UploadKonfigDokumenAssetRequest $request, int $lookupId): JsonResponse
    {
        return ApiResponse::success(
            $this->konfigDokumenKService->uploadAsset(
                $lookupId,
                (string) $request->validated('asset'),
                $request->file('file'),
            ),
            'Logo dokumen berhasil diunggah',
        );
    }

    public function deleteAsset(Request $request, int $lookupId, string $asset): JsonResponse
    {
        return ApiResponse::success(
            $this->konfigDokumenKService->removeAsset($lookupId, $asset),
            'Logo dokumen berhasil dihapus',
        );
    }
}
