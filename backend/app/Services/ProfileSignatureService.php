<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 15:02:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 15:02:00
 */

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileSignatureService
{
    public function upload(User $user, UploadedFile $file): User
    {
        $this->deleteStoredSignature($user->path_tanda_tangan);

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'png');
        $filename = 'user_'.$user->id.'_'.now()->format('YmdHis').'.'.$extension;
        $storedPath = $file->storeAs('users/'.$user->id.'/signature', $filename, 'public');
        $publicPath = '/storage/'.$storedPath;

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
        if (! is_string($path) || ! str_starts_with($path, '/storage/')) {
            return;
        }

        $relative = ltrim(substr($path, strlen('/storage/')), '/');

        if ($relative !== '' && str_starts_with($relative, 'users/')) {
            Storage::disk('public')->delete($relative);
        }
    }
}
