<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 16:44:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 16:44:59
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOwnProfileRequest;
use App\Http\Responses\ApiResponse;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly ProfileService $profileService) {}

    public function show(Request $request): JsonResponse
    {
        return ApiResponse::success($this->profileService->show($request->user()));
    }

    public function update(UpdateOwnProfileRequest $request): JsonResponse
    {
        $result = $this->profileService->updateJamaah($request->user(), $request->validated());

        return ApiResponse::success($result, 'Profil jamaah berhasil diperbarui');
    }
}
