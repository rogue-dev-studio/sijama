<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 14:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 14:10:00
 */

namespace App\Http\Controllers;

use App\Support\MediaMimeType;
use App\Support\UploadStorage;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PublicMediaController extends Controller
{
    private const ALLOWED_PREFIXES = [
        'jamaah/',
        'konfig/',
        'users/',
        'share/',
    ];

    public function show(Request $request, string $path): Response
    {
        $path = ltrim($path, '/');

        if ($path === '' || str_contains($path, '..')) {
            abort(404);
        }

        $allowed = false;
        foreach (self::ALLOWED_PREFIXES as $prefix) {
            if (str_starts_with($path, $prefix)) {
                $allowed = true;
                break;
            }
        }

        if (! $allowed) {
            abort(404);
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

        return response($content, 200, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=86400',
            'Access-Control-Allow-Origin' => '*',
            'Cross-Origin-Resource-Policy' => 'cross-origin',
        ]);
    }
}
