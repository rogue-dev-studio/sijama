<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 12:28:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:28:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\LookupOptionsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LookupOptionsController extends Controller
{
    public function __construct(private readonly LookupOptionsService $lookupOptionsService) {}

    public function __invoke(Request $request): JsonResponse
    {
        $raw = $request->query('types', '');
        if (is_array($raw)) {
            $types = $raw;
        } else {
            $types = preg_split('/\s*,\s*/', (string) $raw, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        }

        return ApiResponse::success($this->lookupOptionsService->byTypes($types));
    }
}
