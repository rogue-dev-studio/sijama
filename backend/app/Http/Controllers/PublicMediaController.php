<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 04:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 04:15:00
 */

namespace App\Http\Controllers;

use App\Support\MediaMimeType;
use App\Support\MediaPathGuard;
use App\Support\UploadStorage;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PublicMediaController extends Controller
{
    public function show(Request $request, string $path): Response
    {
        $path = MediaPathGuard::normalize($path);

        if (MediaPathGuard::matchesPrefix($path, MediaPathGuard::SIGNED_PREFIXES)) {
            MediaPathGuard::assertSignedAllowed($path);

            if (! $request->hasValidSignature()) {
                abort(403);
            }
        } else {
            MediaPathGuard::assertPublicAllowed($path);
        }

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
        $cacheControl = MediaPathGuard::matchesPrefix($path, MediaPathGuard::SIGNED_PREFIXES)
            ? 'private, max-age=3600'
            : 'public, max-age=86400';

        return response($content, 200, [
            'Content-Type' => $mime,
            'Cache-Control' => $cacheControl,
            'Cross-Origin-Resource-Policy' => 'cross-origin',
        ]);
    }
}
