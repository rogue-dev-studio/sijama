<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:50:00
 */

namespace Tests\Feature;

use App\Models\Jamaah;
use App\Support\UploadStorage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class ProfilePhotoTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_user_can_upload_and_delete_profile_photo(): void
    {
        Storage::fake('public');

        $user = $this->createAuthorizedUser(username: 'photo.user', permissionSlugs: []);
        $jamaah = Jamaah::query()->create([
            'nama' => $user->name,
            'gender' => 'L',
            'no_hp' => '081122334455',
            'email' => 'photo.user@sijama.test',
            'status' => 'aktif',
        ]);
        $user->updateAttributes(['jamaah_id' => $jamaah->id]);

        $upload = $this->actingAs($user, 'sanctum')->post('/api/profile/photo', [
            'file' => UploadedFile::fake()->image('avatar.jpg', 200, 200),
        ]);

        $upload->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.jamaah.foto_path', fn ($value) => is_string($value) && str_starts_with($value, '/storage/jamaah/'));

        $fotoPath = $upload->json('data.jamaah.foto_path');
        $relative = UploadStorage::relativePath((string) $fotoPath);
        Storage::disk(UploadStorage::diskName())->assertExists($relative);

        $delete = $this->actingAs($user, 'sanctum')->deleteJson('/api/profile/photo');

        $delete->assertOk()
            ->assertJsonPath('data.jamaah.foto_path', null);

        Storage::disk(UploadStorage::diskName())->assertMissing($relative);
    }

    public function test_user_without_jamaah_cannot_upload_profile_photo(): void
    {
        Storage::fake('public');

        $user = $this->createAuthorizedUser(username: 'no.jamaah', permissionSlugs: []);

        $response = $this->actingAs($user, 'sanctum')->post('/api/profile/photo', [
            'file' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['jamaah']);
    }
}
