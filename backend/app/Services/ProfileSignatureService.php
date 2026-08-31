<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 15:02:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 15:02:00
 */

namespace App\Services;

use App\Models\User;
use App\Support\UploadStorage;
use Illuminate\Http\UploadedFile;

class ProfileSignatureService
{
    public function upload(User $user, UploadedFile $file): User
    {
        $this->deleteStoredSignature($user->path_tanda_tangan);

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'png');
        $filename = 'user_'.$user->id.'_'.now()->format('YmdHis').'.'.$extension;
        $publicPath = UploadStorage::storeUploadedAs($file, 'users/'.$user->id.'/signature', $filename);

        $user->update([
            'path_tanda_tangan' => $publicPath,
        ]);

        return $user->fresh();
    }

    public function remove(User $user): User
    {
        $this->deleteStoredSignature($user->path_tanda_tangan);

        $user->update([
            'path_tanda_tangan' => null,
        ]);

        return $user->fresh();
    }

    private function deleteStoredSignature(?string $path): void
    {
        UploadStorage::delete($path, 'users/');
    }
}
