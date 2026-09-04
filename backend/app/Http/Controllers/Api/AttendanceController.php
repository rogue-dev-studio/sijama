<?php

namespace App\Http\Controllers\Api;

use App\DTOs\CheckInData;
use App\DTOs\OpenSessionData;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckInRequest;
use App\Http\Requests\OpenSessionRequest;
use App\Http\Resources\AttendanceSessionResource;
use App\Http\Responses\ApiResponse;
use App\Services\AttendanceService;
use App\Support\PaginationHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function __construct(private readonly AttendanceService $attendanceService) {}

    public function openSession(OpenSessionRequest $request): JsonResponse
    {
        $session = $this->attendanceService->openSession(
            OpenSessionData::fromArray($request->validated()),
            $request->user(),
        );

        return ApiResponse::success($session, 'Sesi absensi dibuka', 201);
    }

    public function closeSession(Request $request, int $session): JsonResponse
    {
        $result = $this->attendanceService->closeSession($session, $request->user());

        return ApiResponse::success($result, 'Sesi absensi ditutup');
    }

    public function checkIn(CheckInRequest $request, int $session): JsonResponse
    {
        $attendance = $this->attendanceService->checkIn(
            $session,
            CheckInData::fromArray($request->validated()),
            $request->user(),
        );

        return ApiResponse::success($attendance, 'Absensi berhasil dicatat', 201);
    }

    public function showSession(Request $request, int $session): JsonResponse
    {
        return ApiResponse::success($this->attendanceService->showSession($session, $request->user()));
    }

    public function listSessions(Request $request): JsonResponse
    {
        $paginator = $this->attendanceService->listSessions(
            $request->user(),
            $request->query('status') ?: null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $request->query('date_from') ?: null,
            $request->query('date_to') ?: null,
        );

        return ApiResponse::success(
            PaginationHelper::envelope($paginator, AttendanceSessionResource::collection($paginator->items()))
        );
    }
}
