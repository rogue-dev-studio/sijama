<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 17:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:20:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadShareExportRequest;
use App\Http\Responses\ApiResponse;
use App\Services\ShareExportService;
use Illuminate\Http\JsonResponse;

class ShareExportController extends Controller
{
    public function __construct(private readonly ShareExportService $shareExportService) {}

    public function store(UploadShareExportRequest $request): JsonResponse
    {
        $result = $this->shareExportService->storeTemporaryExport(
            $request->file('file'),
        );

        return ApiResponse::success($result, 'Berkas siap dibagikan');
    }
}
