<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Responses\ApiResponse;
use App\Services\AuthService;
use App\Services\TrustedAdminDeviceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly TrustedAdminDeviceService $trustedAdminDeviceService,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated('username'),
            $request->validated('password'),
            $request,
        );

        return ApiResponse::success($result, 'Login berhasil');
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user(), $request);

        return ApiResponse::success(null, 'Logout berhasil');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->trustedAdminDeviceService->remember(
            $user,
            $request,
            $request->header('X-Device-Key'),
        );

        return ApiResponse::success($this->authService->buildAuthPayload($user));
    }
}
