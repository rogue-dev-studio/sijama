<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:10:00
 */

namespace Tests\Feature;

use App\Models\Jamaah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\Support\SeedsLookupM;
use Tests\TestCase;

class JamaahContactValidationTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;
    use SeedsLookupM;

    public function test_jamaah_can_be_created_without_phone_and_email(): void
    {
        $this->seedLookupM();
        $user = $this->createAuthorizedUser(permissionSlugs: ['jamaah.create']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/jamaah', [
            'nama' => 'Tanpa Kontak',
            'gender' => 'L',
            'status' => 'aktif',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('jamaah', [
            'nama' => 'Tanpa Kontak',
            'no_hp' => null,
            'email' => null,
        ]);
    }

    public function test_jamaah_phone_must_be_unique_when_filled(): void
    {
        $this->seedLookupM();
        $user = $this->createAuthorizedUser(permissionSlugs: ['jamaah.create']);
        Jamaah::query()->create([
            'nama' => 'Existing',
            'gender' => 'L',
            'no_hp' => '081111111111',
            'status' => 'aktif',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/jamaah', [
            'nama' => 'Duplikat HP',
            'gender' => 'P',
            'no_hp' => '081111111111',
            'status' => 'aktif',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['no_hp']);
    }
}
