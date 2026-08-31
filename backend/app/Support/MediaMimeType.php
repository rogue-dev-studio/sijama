<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 15:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 15:20:00
 */

namespace App\Support;

use Illuminate\Contracts\Filesystem\Filesystem;

class MediaMimeType
{
    public static function forPath(string $path, ?Filesystem $disk = null): string
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        $fromExtension = match ($extension) {
            'svg' => 'image/svg+xml',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'ico' => 'image/x-icon',
            default => null,
        };

        if ($fromExtension !== null) {
            return $fromExtension;
        }

        if ($disk !== null) {
            try {
                $detected = $disk->mimeType($path);
                if (is_string($detected) && $detected !== '') {
                    return $detected;
                }
            } catch (\Throwable) {
                // R2 tidak mendukung beberapa metadata ACL; fallback aman di bawah.
            }
        }

        return 'application/octet-stream';
    }
}
