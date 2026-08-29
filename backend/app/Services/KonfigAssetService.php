<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:24:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:24:00
 */

namespace App\Services;

use App\Models\KonfigSystemK;
use App\Support\SystemKonfig;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class KonfigAssetService
{
    /** @var array<string, string> */
    private const ASSET_COLUMNS = [
        'logo-header' => 'path_logoheader',
        'favicon' => 'path_favicon',
        'logo-footer' => 'path_logofooter',
        'background' => 'path_background',
        'maintenance-background' => 'path_maintenance_background',
    ];

    public function upload(KonfigSystemK $konfig, string $asset, UploadedFile $file): KonfigSystemK
    {
        $column = $this->resolveColumn($asset);

        $this->deleteStoredAsset($konfig->{$column});

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'png');
        $filename = str_replace('-', '_', $asset).'_'.now()->format('YmdHis').'.'.$extension;
        $storedPath = $file->storeAs('konfig', $filename, 'public');
        $publicPath = '/storage/'.$storedPath;

        $konfig->update([
            $column => $publicPath,
            'last_modified_date' => now(),
            'last_modified_by' => Auth::id(),
            'modified_count' => ((int) $konfig->modified_count) + 1,
        ]);

        SystemKonfig::forgetCache();

        return $konfig->fresh();
    }

    public function remove(KonfigSystemK $konfig, string $asset): KonfigSystemK
    {
        $column = $this->resolveColumn($asset);

        $this->deleteStoredAsset($konfig->{$column});

        $konfig->update([
            $column => null,
            'last_modified_date' => now(),
            'last_modified_by' => Auth::id(),
            'modified_count' => ((int) $konfig->modified_count) + 1,
        ]);

        SystemKonfig::forgetCache();

        return $konfig->fresh();
    }

    private function resolveColumn(string $asset): string
    {
        $column = self::ASSET_COLUMNS[$asset] ?? null;

        if (! $column) {
            throw new InvalidArgumentException('Jenis aset konfig tidak valid.');
        }

        return $column;
    }

    private function deleteStoredAsset(?string $path): void
    {
        if (! is_string($path) || ! str_starts_with($path, '/storage/')) {
            return;
        }

        $relative = ltrim(substr($path, strlen('/storage/')), '/');

        if ($relative !== '' && str_starts_with($relative, 'konfig/')) {
            Storage::disk('public')->delete($relative);
        }
    }
}
