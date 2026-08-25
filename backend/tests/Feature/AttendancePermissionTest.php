<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:21:51
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:21:51
 */

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class AttendancePermissionTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_attendance_sessions_forbidden_without_permission(): void
    {
        $user = $this->createAuthorizedUser(
            permissionSlugs: [],
            username: 'absensi.none',
            dapukanSlug: 'absensi_none',
        );

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/attendance/sessions')
            ->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Akses ditolak.');
    }

    public function test_attendance_sessions_allowed_with_view_permission(): void
    {
        $user = $this->createAuthorizedUser(
            permissionSlugs: ['absensi.view'],
            username: 'absensi.view',
            dapukanSlug: 'absensi_view',
        );

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/attendance/sessions')
            ->assertOk()
            ->assertJsonPath('success', true);
    }
}
