<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 01:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 01:00:00
 */

namespace Tests\Feature;

use App\Models\Dapukan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class MasterUserShowGuardTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_non_superadmin_cannot_show_superadmin_user(): void
    {
        $superadmin = $this->createSuperAdminUser('root.view');
        $actor = $this->createAuthorizedUser(
            permissionSlugs: ['users.view'],
            username: 'admin.pusat.view',
            dapukanSlug: 'admin_pusat_view',
        );

        $this->actingAs($actor, 'sanctum')
            ->getJson('/api/master/users/'.$superadmin->id)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    private function createSuperAdminUser(string $username): User
    {
        $dapukan = Dapukan::query()->firstOrCreate(
            ['slug' => 'superadmin'],
            [
                'nama' => 'Super Admin',
                'tingkat' => 'global',
                'urutan' => 1,
                'is_system' => true,
                'is_active' => true,
            ],
        );

        return User::createManaged([
            'name' => 'Super Admin Test',
            'username' => $username,
            'email' => $username.'@sijama.test',
            'password' => 'password',
            'dapukan_id' => $dapukan->id,
            'is_active' => true,
        ]);
    }
}
