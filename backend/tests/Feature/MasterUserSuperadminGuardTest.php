<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 17:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 17:15:00
 */

namespace Tests\Feature;

use App\Models\Dapukan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class MasterUserSuperadminGuardTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_non_superadmin_cannot_update_superadmin_user(): void
    {
        $superadmin = $this->createSuperAdminUser('root.admin');
        $actor = $this->createAuthorizedUser(
            permissionSlugs: ['users.view', 'users.update'],
            username: 'admin.pusat',
            dapukanSlug: 'admin_pusat_guard',
        );

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/users/'.$superadmin->id, [
                'username' => 'hacked-admin',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['username']);

        $this->assertDatabaseHas('users', [
            'id' => $superadmin->id,
            'username' => 'root.admin',
        ]);
    }

    public function test_non_superadmin_cannot_deactivate_superadmin_user(): void
    {
        $superadmin = $this->createSuperAdminUser('root.admin2');
        $actor = $this->createAuthorizedUser(
            permissionSlugs: ['users.view', 'users.update'],
            username: 'admin.daerah',
            dapukanSlug: 'admin_daerah_guard',
        );

        $this->actingAs($actor, 'sanctum')
            ->postJson('/api/master/users/'.$superadmin->id.'/deactivate')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['username']);

        $this->assertDatabaseHas('users', [
            'id' => $superadmin->id,
            'is_active' => true,
        ]);
    }

    public function test_superadmin_can_update_superadmin_user(): void
    {
        $target = $this->createSuperAdminUser('root.admin3');
        $actor = $this->createSuperAdminUser('root.admin4');
        $this->grantPermissions($actor, ['users.view', 'users.update']);

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/users/'.$target->id, [
                'username' => 'root.admin3-updated',
            ])
            ->assertOk()
            ->assertJsonPath('data.username', 'root.admin3-updated');
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

    /**
     * @param  list<string>  $permissionSlugs
     */
    private function grantPermissions(User $user, array $permissionSlugs): void
    {
        $dapukan = $user->dapukan;
        if (! $dapukan) {
            return;
        }

        $menu = \App\Models\Menu::query()->create([
            'slug' => 'test-menu-'.$user->username,
            'nama' => 'Test Menu',
            'path' => '/test',
            'icon' => 'box',
            'urutan' => 1,
            'is_active' => true,
        ]);

        $fitur = \App\Models\Fitur::query()->create([
            'menu_id' => $menu->id,
            'slug' => 'test-fitur-'.$user->username,
            'nama' => 'Test Fitur',
            'is_active' => true,
        ]);

        $hakIds = [];
        foreach ($permissionSlugs as $slug) {
            $hak = \App\Models\HakAkses::query()->create([
                'fitur_id' => $fitur->id,
                'slug' => $slug,
                'nama' => $slug,
                'aksi' => str_contains($slug, '.') ? explode('.', $slug)[1] : 'view',
            ]);
            $hakIds[] = $hak->id;
        }

        $existing = $dapukan->hakAkses()->pluck('hak_akses_m.id')->all();
        $dapukan->hakAkses()->sync(array_values(array_unique(array_merge($existing, $hakIds))));
    }
}
