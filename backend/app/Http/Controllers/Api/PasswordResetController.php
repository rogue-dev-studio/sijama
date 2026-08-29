<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:25:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Responses\ApiResponse;
use App\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    public function __construct(private readonly PasswordResetService $passwordResetService) {}

    public function store(ForgotPasswordRequest $request): JsonResponse
    {
        $result = $this->passwordResetService->requestReset($request->validated('identifier'));

        if ($result['channel'] === 'unknown') {
            return ApiResponse::success(
                $result,
                'Jika email atau nomor HP terdaftar, instruksi reset password akan dikirim.',
            );
        }

        $message = $result['channel'] === 'email'
            ? 'Tautan reset password telah dikirim ke email terdaftar.'
            : 'Kode OTP reset password telah dikirim ke nomor HP terdaftar.';

        return ApiResponse::success($result, $message);
    }

    public function update(ResetPasswordRequest $request): JsonResponse
    {
        $this->passwordResetService->resetPassword(
            $request->validated('identifier'),
            $request->validated('password'),
            $request->validated('token'),
            $request->validated('otp'),
        );

        return ApiResponse::success(null, 'Password berhasil diperbarui. Silakan login.');
    }
}
