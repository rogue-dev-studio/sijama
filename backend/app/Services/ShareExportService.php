<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 17:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:20:00
 */

namespace App\Services;

use App\Support\UploadStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class ShareExportService
{
    private const SHARE_DIR = 'share/exports';

    private const TTL_HOURS = 24;

    /**
     * @return array{path: string, url: string, filename: string, expires_at: string}
     */
    public function storeTemporaryExport(UploadedFile $file): array
    {
        $this->purgeExpiredExports();

        $extension = strtolower($file->getClientOriginalExtension() ?: 'bin');
        $allowed = ['pdf', 'xlsx', 'csv'];
        if (! in_array($extension, $allowed, true)) {
            $extension = match ($file->getMimeType()) {
                'application/pdf' => 'pdf',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
                'text/csv', 'text/plain' => 'csv',
                default => 'bin',
            };
        }

        $storedName = Str::uuid()->toString().'.'.$extension;
        $relative = UploadStorage::storeUploadedAsPath($file, self::SHARE_DIR, $storedName);
        $expiresAt = now()->addHours(self::TTL_HOURS);
        $url = URL::temporarySignedRoute(
            'storage.public',
            $expiresAt,
            ['path' => $relative],
        );

        return [
            'path' => UploadStorage::publicPath($relative),
            'url' => $url,
            'filename' => $file->getClientOriginalName() ?: $storedName,
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }

    private function purgeExpiredExports(): void
    {
        $disk = UploadStorage::disk();
        if (! $disk->exists(self::SHARE_DIR)) {
            return;
        }

        $cutoff = now()->subHours(self::TTL_HOURS)->getTimestamp();
        foreach ($disk->files(self::SHARE_DIR) as $path) {
            if ($disk->lastModified($path) < $cutoff) {
                $disk->delete($path);
            }
        }
    }
}
