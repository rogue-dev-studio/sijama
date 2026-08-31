<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:45:00
 */

namespace App\Services;

use App\Models\Jamaah;
use App\Support\UploadStorage;
use Illuminate\Http\UploadedFile;

class ProfilePhotoService
{
    public function upload(Jamaah $jamaah, UploadedFile $file): Jamaah
    {
        $this->deleteStoredPhoto($jamaah->foto_path);

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        $filename = 'jamaah_'.$jamaah->id.'_'.now()->format('YmdHis').'.'.$extension;
        $publicPath = UploadStorage::storeUploadedAs($file, 'jamaah/'.$jamaah->id, $filename);

        $jamaah->update([
            'foto_path' => $publicPath,
        ]);

        return $jamaah->fresh();
    }

    public function remove(Jamaah $jamaah): Jamaah
    {
        $this->deleteStoredPhoto($jamaah->foto_path);

        $jamaah->update([
            'foto_path' => null,
        ]);

        return $jamaah->fresh();
    }

    private function deleteStoredPhoto(?string $path): void
    {
        UploadStorage::delete($path, 'jamaah/');
    }
}
