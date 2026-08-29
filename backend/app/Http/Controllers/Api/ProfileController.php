<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 16:44:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 13:35:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOwnLoginSessionRequest;
use App\Http\Requests\UpdateOwnPasswordRequest;
use App\Http\Requests\UpdateOwnProfileRequest;
use App\Http\Requests\UploadProfilePhotoRequest;
use App\Http\Responses\ApiResponse;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly ProfileService $profileService) {}

    public function show(Request $request): JsonResponse
    {
        return ApiResponse::success(
            $this->profileService->show($request->user(), $request->user()->currentAccessToken()),
        );
    }

    public function wilayahOptions(Request $request): JsonResponse
    {
        $level = (string) $request->query('level', '');
        $parentId = $request->query('parent_id');
        $parentId = $parentId !== null && $parentId !== '' ? (int) $parentId : null;

        $items = $this->profileService->wilayahOptions($level, $parentId);

        return ApiResponse::success(['items' => $items]);
    }

    public function wilayahFromNik(Request $request): JsonResponse
    {
        $nik = (string) $request->query('nik', '');

        return ApiResponse::success($this->profileService->resolveWilayahFromNik($nik));
    }

    public function update(UpdateOwnProfileRequest $request): JsonResponse
    {
        $result = $this->profileService->updateJamaah($request->user(), $request->validated());

        return ApiResponse::success($result, 'Profil jamaah berhasil diperbarui');
    }

    public function updatePassword(UpdateOwnPasswordRequest $request): JsonResponse
    {
        $this->profileService->updatePassword($request->user(), (string) $request->validated('password'));

        return ApiResponse::success(null, 'Password berhasil diperbarui');
    }

    public function updateLoginSession(UpdateOwnLoginSessionRequest $request): JsonResponse
    {
        $minutes = $request->validated('login_remember_minutes');
        $minutes = $minutes === null ? null : (int) $minutes;
        $untilLogout = $request->boolean('login_remember_until_logout');

        $result = $this->profileService->updateLoginSession(
            $request->user(),
            $minutes,
            $untilLogout,
            $request->user()->currentAccessToken(),
        );

        return ApiResponse::success($result, 'Preferensi sesi login berhasil disimpan');
    }

    public function uploadPhoto(UploadProfilePhotoRequest $request): JsonResponse
    {
        $result = $this->profileService->uploadPhoto(
            $request->user(),
            $request->file('file'),
        );

        return ApiResponse::success($result, 'Foto profil berhasil diunggah');
    }

    public function deletePhoto(Request $request): JsonResponse
    {
        $result = $this->profileService->deletePhoto($request->user());

        return ApiResponse::success($result, 'Foto profil berhasil dihapus');
    }
}
