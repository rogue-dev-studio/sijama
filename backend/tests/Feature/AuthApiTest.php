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

class AuthApiTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_login_succeeds_with_valid_credentials(): void
    {
        $this->createAuthorizedUser(username: 'login.user');

        $response = $this->postJson('/api/login', [
            'username' => 'login.user',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => ['id', 'username'],
                    'permissions',
                    'menus',
                ],
            ]);
    }

    public function test_login_succeeds_with_email(): void
    {
        $this->createAuthorizedUser(username: 'login.email', permissionSlugs: []);

        $response = $this->postJson('/api/login', [
            'username' => 'login.email@sijama.test',
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonPath('data.user.username', 'login.email');
    }

    public function test_login_succeeds_with_jamaah_phone(): void
    {
        $user = $this->createAuthorizedUser(username: 'login.phone', permissionSlugs: []);
        $jamaah = \App\Models\Jamaah::query()->create([
            'nama' => $user->name,
            'gender' => 'L',
            'no_hp' => '081234567890',
            'email' => 'login.phone@sijama.test',
            'status' => 'aktif',
        ]);
        $user->update(['jamaah_id' => $jamaah->id, 'email' => $jamaah->email]);

        $response = $this->postJson('/api/login', [
            'username' => '081234567890',
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonPath('data.user.username', 'login.phone');
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $this->createAuthorizedUser(username: 'login.user');

        $response = $this->postJson('/api/login', [
            'username' => 'login.user',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/me')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_me_returns_payload_for_authenticated_user(): void
    {
        $user = $this->createAuthorizedUser(
            permissionSlugs: ['materi.view'],
            username: 'me.user',
        );

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.username', 'me.user')
            ->assertJsonPath('data.permissions.0', 'materi.view');
    }
}
