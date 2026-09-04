<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:42:08
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SyncHariLiburKonfigRequest;
use App\Http\Requests\UpdateKonfigSystemKRequest;
use App\Http\Requests\UploadKonfigAssetRequest;
use App\Http\Resources\KonfigSystemKResource;
use App\Http\Responses\ApiResponse;
use App\Support\SystemKonfig;
use App\Services\KonfigAssetService;
use App\Services\KonfigSystemKService;
use App\Services\ApiCoIdHolidayService;
use App\Services\AuditActivityService;
use App\Services\TrustedAdminDeviceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class KonfigSystemKController extends Controller
{
    public function __construct(
        private readonly KonfigSystemKService $konfigSystemKService,
        private readonly KonfigAssetService $konfigAssetService,
        private readonly TrustedAdminDeviceService $trustedAdminDeviceService,
        private readonly AuditActivityService $auditActivityService,
    ) {}

    public function publicShow(Request $request): JsonResponse
    {
        $settings = $this->konfigSystemKService->publicSettings();
        $settings['maintenance_login_allowed'] = $this->trustedAdminDeviceService->isAllowed(
            $request,
            $request->header('X-Device-Key'),
        );

        return ApiResponse::success($settings);
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

        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_KONFIG,
            'action' => 'konfig_system_upload_asset',
            'entity_type' => 'konfig_system',
            'entity_id' => $konfig->konfigsystem_id ?? null,
            'entity_label' => 'Konfigurasi Sistem',
            'summary' => sprintf('Unggah aset sistem %s', $asset),
            'meta' => ['asset' => $asset],
        ]);

        return ApiResponse::success(
            new KonfigSystemKResource($updated),
            'Aset berhasil diunggah',
        );
    }

    public function deleteAsset(string $asset): JsonResponse
    {
        $konfig = $this->konfigSystemKService->resolveModel();
        $updated = $this->konfigAssetService->remove($konfig, $asset);

        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_KONFIG,
            'action' => 'konfig_system_delete_asset',
            'entity_type' => 'konfig_system',
            'entity_id' => $konfig->konfigsystem_id ?? null,
            'entity_label' => 'Konfigurasi Sistem',
            'summary' => sprintf('Hapus aset sistem %s', $asset),
            'meta' => ['asset' => $asset],
        ]);

        return ApiResponse::success(
            new KonfigSystemKResource($updated),
            'Aset berhasil dihapus',
        );
    }

    public function syncHariLibur(SyncHariLiburKonfigRequest $request, ApiCoIdHolidayService $service): JsonResponse
    {
        SystemKonfig::applyRuntimeConfig();

        try {
            $results = $service->syncFromOptions($request->validated());
        } catch (RuntimeException $exception) {
            return ApiResponse::error($exception->getMessage(), null, 422);
        }

        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_KONFIG,
            'action' => 'hari_libur_sync',
            'entity_type' => 'hari_libur',
            'entity_label' => 'Hari Libur',
            'summary' => 'Sinkron hari libur dari api.co.id',
            'meta' => is_array($results) ? $results : ['result' => $results],
        ]);

        $konfig = $this->konfigSystemKService->resolveModel()->fresh();

        return ApiResponse::success([
            'results' => $results,
            'last_synced_at' => $konfig?->api_co_id_holiday_last_synced_at?->toIso8601String(),
            'last_sync_count' => $konfig?->api_co_id_holiday_last_sync_count,
        ], 'Hari libur berhasil disinkronkan');
    }
}
