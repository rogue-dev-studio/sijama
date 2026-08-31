<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 13:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 13:50:00
 */

namespace App\Support;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UploadStorage
{
    public static function diskName(): string
    {
        return (string) config('filesystems.upload_disk', 'public');
    }

    public static function disk(): Filesystem
    {
        return Storage::disk(self::diskName());
    }

    public static function storeUploadedAs(UploadedFile $file, string $directory, string $filename): string
    {
        $options = ['disk' => self::diskName()];
        if (self::diskName() === 's3') {
            $options['visibility'] = 'public';
        }

        $relative = $file->storeAs($directory, $filename, $options);

        return self::publicPath($relative);
    }

    public static function storeUploadedAsPath(UploadedFile $file, string $directory, string $filename): string
    {
        $options = ['disk' => self::diskName()];
        if (self::diskName() === 's3') {
            $options['visibility'] = 'public';
        }

        return $file->storeAs($directory, $filename, $options);
    }

    public static function publicPath(string $relative): string
    {
        return '/storage/'.ltrim($relative, '/');
    }

    public static function delete(?string $storedPath, string $requiredPrefix): void
    {
        $relative = self::relativePath($storedPath);

        if ($relative === null || ! str_starts_with($relative, $requiredPrefix)) {
            return;
        }

        if (self::disk()->exists($relative)) {
            self::disk()->delete($relative);
        }
    }

    public static function relativePath(?string $storedPath): ?string
    {
        if (! is_string($storedPath) || $storedPath === '') {
            return null;
        }

        if (str_starts_with($storedPath, '/storage/')) {
            return ltrim(substr($storedPath, strlen('/storage/')), '/');
        }

        $baseUrl = rtrim((string) config('filesystems.disks.s3.url'), '/');
        if ($baseUrl !== '' && str_starts_with($storedPath, $baseUrl)) {
            return ltrim(substr($storedPath, strlen($baseUrl)), '/');
        }

        if (str_starts_with($storedPath, 'http://') || str_starts_with($storedPath, 'https://')) {
            $path = parse_url($storedPath, PHP_URL_PATH);

            return is_string($path) ? ltrim($path, '/') : null;
        }

        return null;
    }
}
