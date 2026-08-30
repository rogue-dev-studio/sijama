<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 17:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:20:00
 */

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
        $file->storeAs(self::SHARE_DIR, $storedName, 'public');

        $relativePath = '/storage/'.self::SHARE_DIR.'/'.$storedName;
        $baseUrl = rtrim((string) config('app.url'), '/');

        return [
            'path' => $relativePath,
            'url' => $baseUrl.$relativePath,
            'filename' => $file->getClientOriginalName() ?: $storedName,
            'expires_at' => now()->addHours(self::TTL_HOURS)->toIso8601String(),
        ];
    }

    private function purgeExpiredExports(): void
    {
        $disk = Storage::disk('public');
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
