<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:28:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 15:02:00
 */

namespace Tests\Feature;

use App\Models\Dapukan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class DemoUserGuardTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_demo_user_cannot_be_deleted(): void
    {
        $demo = $this->createDemoUser('demo.pusat', 'admin_pusat_demo');

        $this->expectException(\Illuminate\Validation\ValidationException::class);
        $demo->delete();
    }

    public function test_nobody_can_deactivate_demo_user(): void
    {
        $demo = $this->createDemoUser('demo.operator', 'admin_kelompok_demo');
        $actor = $this->createSuperAdminUser('super.actor');
        $this->grantPermissions($actor, ['users.view', 'users.update']);

        $this->actingAs($actor, 'sanctum')
            ->postJson('/api/master/users/'.$demo->id.'/deactivate')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['username']);

        $this->assertDatabaseHas('users', [
            'id' => $demo->id,
            'is_active' => true,
            'is_demo' => true,
        ]);
    }

    public function test_nobody_can_update_demo_user_or_password(): void
    {
        $demo = $this->createDemoUser('demo.jamaah', 'jamaah_kelompok_demo');
        $actor = $this->createSuperAdminUser('super.editor');
        $this->grantPermissions($actor, ['users.view', 'users.update']);

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/users/'.$demo->id, [
                'password' => 'newpassword123',
                'is_active' => false,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['username']);

        $fresh = $demo->fresh();
        $this->assertTrue($fresh->is_active);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('password', $fresh->password));
    }

    public function test_system_dapukan_cannot_be_updated_or_deactivated(): void
    {
        $dapukan = Dapukan::query()->firstOrCreate(
            ['slug' => 'admin_pusat'],
            [
                'nama' => 'Admin Pusat',
                'tingkat' => 'pusat',
                'urutan' => 2,
                'is_system' => true,
                'is_active' => true,
            ],
        );

        $actor = $this->createSuperAdminUser('super.dapukan');
        $this->grantPermissions($actor, ['dapukan.view', 'dapukan.update']);

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/dapukan/'.$dapukan->id, [
                'slug' => 'admin_pusat',
                'nama' => 'Admin Pusat Diubah',
                'urutan' => 99,
                'is_active' => false,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['dapukan']);

        $this->assertDatabaseHas('dapukan_m', [
            'id' => $dapukan->id,
            'nama' => $dapukan->nama,
            'is_active' => true,
        ]);
    }

    public function test_superadmin_cannot_change_password_from_profile(): void
    {
        $actor = $this->createSuperAdminUser('super.profile');

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/profile/password', [
                'current_password' => 'password',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $this->assertTrue(
            \Illuminate\Support\Facades\Hash::check('password', $actor->fresh()->password),
        );
    }

    private function createDemoUser(string $username, string $dapukanSlug): User
    {
        $dapukan = Dapukan::query()->firstOrCreate(
            ['slug' => $dapukanSlug],
            [
                'nama' => ucfirst(str_replace('_', ' ', $dapukanSlug)),
                'tingkat' => 'kelompok',
                'urutan' => 10,
                'is_system' => true,
                'is_active' => true,
            ],
        );

        return User::createManaged([
            'name' => 'Demo '.$username,
            'username' => $username,
            'email' => $username.'@sijama.test',
            'password' => 'password',
            'dapukan_id' => $dapukan->id,
            'is_active' => true,
            'is_demo' => true,
        ]);
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
