<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 14:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 14:10:00
 */

namespace App\Http\Controllers;

use App\Support\UploadStorage;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PublicMediaController extends Controller
{
    private const ALLOWED_PREFIXES = [
        'jamaah/',
        'konfig/',
        'users/',
        'share/',
    ];

    public function show(Request $request, string $path): StreamedResponse
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

        if (! $disk->exists($path)) {
            abort(404);
        }

        $mime = $disk->mimeType($path) ?: 'application/octet-stream';
        $stream = $disk->readStream($path);

        if ($stream === false) {
            abort(404);
        }

        return response()->stream(function () use ($stream): void {
            fpassthrough($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
