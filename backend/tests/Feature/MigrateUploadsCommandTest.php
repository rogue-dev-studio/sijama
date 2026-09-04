<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 10:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:50:00
 */

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MigrateUploadsCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_migrate_uploads_copies_from_public_to_target_disk(): void
    {
        Storage::fake('public');
        Storage::fake('s3');

        Storage::disk('public')->put('jamaah/1/avatar.jpg', 'photo-bytes');
        Storage::disk('public')->put('konfig/logo.png', 'logo-bytes');

        config(['filesystems.upload_disk' => 's3']);

        $this->artisan('storage:migrate-uploads')
            ->assertSuccessful();

        Storage::disk('s3')->assertExists('jamaah/1/avatar.jpg');
        Storage::disk('s3')->assertExists('konfig/logo.png');
        Storage::disk('public')->assertExists('jamaah/1/avatar.jpg');
    }

    public function test_migrate_uploads_dry_run_does_not_copy(): void
    {
        Storage::fake('public');
        Storage::fake('s3');

        Storage::disk('public')->put('users/1/signature.png', 'sig');

        config(['filesystems.upload_disk' => 's3']);

        $this->artisan('storage:migrate-uploads', ['--dry-run' => true])
            ->assertSuccessful();

        Storage::disk('s3')->assertMissing('users/1/signature.png');
    }

    public function test_migrate_uploads_skips_when_source_equals_target(): void
    {
        Storage::fake('public');

        config(['filesystems.upload_disk' => 'public']);

        $this->artisan('storage:migrate-uploads')
            ->assertSuccessful();
    }
}
