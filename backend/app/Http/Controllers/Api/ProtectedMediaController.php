<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 04:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 04:15:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\DapukanAccessGuard;
use App\Support\MediaMimeType;
use App\Support\MediaPathGuard;
use App\Support\UploadStorage;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ProtectedMediaController extends Controller
{
    public function show(Request $request, string $path): Response
    {
        $path = MediaPathGuard::normalize($path);
        MediaPathGuard::assertAuthenticatedAllowed($path);

        /** @var User $actor */
        $actor = $request->user();
        $this->assertCanAccessUserMedia($actor, $path);

        return $this->streamPath($path);
    }

    private function assertCanAccessUserMedia(User $actor, string $path): void
    {
        if (! preg_match('#^users/(\d+)/#', $path, $matches)) {
            abort(404);
        }

        $ownerId = (int) $matches[1];

        if ($actor->id === $ownerId) {
            return;
        }

        $owner = User::find($ownerId);

        if (! $owner) {
            abort(404);
        }

        DapukanAccessGuard::assertCanManageUser($actor, $owner);
    }

    private function streamPath(string $path): Response
    {
        $disk = UploadStorage::disk();

        try {
            if (! $disk->exists($path)) {
                abort(404);
            }

            $content = $disk->get($path);
        } catch (\Throwable) {
            abort(404);
        }

        if (! is_string($content) || $content === '') {
            abort(404);
        }

        $mime = MediaMimeType::forPath($path, $disk);

        return response($content, 200, [
            'Content-Type' => $mime,
            'Cache-Control' => 'private, max-age=300',
        ]);
    }
}
