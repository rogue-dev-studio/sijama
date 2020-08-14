<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:20:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\KategoriUmurService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KategoriUmurController extends Controller
{
    public function __construct(private readonly KategoriUmurService $kategoriUmurService) {}

    public function index(Request $request): JsonResponse
    {
        $filter = $request->query('kategori');
        $filter = is_string($filter) && $filter !== '' ? $filter : null;

        return ApiResponse::success(
            $this->kategoriUmurService->summary($request->user(), $filter)
        );
    }
}
