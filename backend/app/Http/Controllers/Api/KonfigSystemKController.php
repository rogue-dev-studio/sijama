<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:42:08
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateKonfigSystemKRequest;
use App\Http\Requests\UploadKonfigAssetRequest;
use App\Http\Resources\KonfigSystemKResource;
use App\Http\Responses\ApiResponse;
use App\Services\KonfigAssetService;
use App\Services\KonfigSystemKService;
use Illuminate\Http\JsonResponse;

class KonfigSystemKController extends Controller
{
    public function __construct(
        private readonly KonfigSystemKService $konfigSystemKService,
        private readonly KonfigAssetService $konfigAssetService,
    ) {}

    public function publicShow(): JsonResponse
    {
        return ApiResponse::success($this->konfigSystemKService->publicSettings());
    }

    public function show(): JsonResponse
    {
        return ApiResponse::success($this->konfigSystemKService->current());
    }

    public function update(UpdateKonfigSystemKRequest $request): JsonResponse
    {
        return ApiResponse::success(
            $this->konfigSystemKService->upsert($request->validated()),
            'Konfigurasi sistem berhasil disimpan',
        );
    }

    public function uploadAsset(UploadKonfigAssetRequest $request, string $asset): JsonResponse
    {
        $konfig = $this->konfigSystemKService->resolveModel();
        $updated = $this->konfigAssetService->upload($konfig, $asset, $request->file('file'));

        return ApiResponse::success(
            new KonfigSystemKResource($updated),
            'Aset berhasil diunggah',
        );
    }

    public function deleteAsset(string $asset): JsonResponse
    {
        $konfig = $this->konfigSystemKService->resolveModel();
        $updated = $this->konfigAssetService->remove($konfig, $asset);

        return ApiResponse::success(
            new KonfigSystemKResource($updated),
            'Aset berhasil dihapus',
        );
    }
}
