<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 16:57:14
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 16:57:14
 */

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class PermissionAndMasterApiTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_materi_index_forbidden_without_permission(): void
    {
        $user = $this->createAuthorizedUser(
            permissionSlugs: [],
            username: 'no.perm',
            dapukanSlug: 'no_perm',
        );

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/master/materi')
            ->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Akses ditolak.');
    }

    public function test_materi_crud_with_permissions(): void
    {
        $user = $this->createAuthorizedUser(
            permissionSlugs: [
                'materi.view',
                'materi.create',
                'materi.update',
                'materi.delete',
            ],
            username: 'materi.admin',
            dapukanSlug: 'materi_admin',
        );

        $create = $this->actingAs($user, 'sanctum')
            ->postJson('/api/master/materi', [
                'nama' => 'Tauhid Dasar',
                'deskripsi' => 'Materi uji',
                'is_active' => true,
            ]);

        $create->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nama', 'Tauhid Dasar');

        $id = (int) $create->json('data.id');
        $this->assertDatabaseHas('materi_m', ['id' => $id, 'nama' => 'Tauhid Dasar']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/master/materi')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/master/materi/'.$id, [
                'nama' => 'Tauhid Lanjutan',
                'deskripsi' => 'Updated',
                'is_active' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.nama', 'Tauhid Lanjutan');

        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/master/materi/'.$id)
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('materi_m', ['id' => $id]);
    }

    public function test_debug_face_enroll_unavailable_when_app_debug_false(): void
    {
        config(['app.debug' => false]);

        $user = $this->createAuthorizedUser(username: 'debug.user', dapukanSlug: 'debug_user');

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/debug/face-enroll', [
                'entries' => [['t' => now()->toIso8601String(), 'event' => 'test']],
            ])
            ->assertStatus(404)
            ->assertJsonPath('success', false);
    }
}
