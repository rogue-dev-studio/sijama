<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 17:50:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\CalendarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function __construct(private readonly CalendarService $calendarService) {}

    public function index(Request $request): JsonResponse
    {
        $year = $request->filled('year') ? $request->integer('year') : (int) now()->year;
        $month = $request->filled('month') ? $request->integer('month') : (int) now()->month;

        if ($month < 1 || $month > 12) {
            return ApiResponse::error('Bulan tidak valid.', ['month' => ['Bulan harus 1–12.']], 422);
        }

        if ($year < 1970 || $year > 2100) {
            return ApiResponse::error('Tahun tidak valid.', ['year' => ['Tahun di luar rentang.']], 422);
        }

        return ApiResponse::success($this->calendarService->month($year, $month));
    }
}
