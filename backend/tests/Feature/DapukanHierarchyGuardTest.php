<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 17:45:00
 */

namespace Tests\Feature;

use App\Models\Dapukan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class DapukanHierarchyGuardTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_lower_tier_cannot_update_higher_tier_user(): void
    {
        $target = $this->createUserForTingkat('admin.pusat.target', 'pusat', 'admin_pusat_target');
        $actor = $this->createUserForTingkat(
            'admin.daerah.actor',
            'daerah',
            'admin_daerah_actor',
            ['users.view', 'users.update'],
        );

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/users/'.$target->id, [
                'username' => 'hacked-pusat',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['username']);

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'username' => 'admin.pusat.target',
        ]);
    }

    public function test_non_superadmin_cannot_update_matriks_routes(): void
    {
        $dapukan = Dapukan::query()->create([
            'slug' => 'admin_daerah_matriks',
            'nama' => 'Admin Daerah Matriks',
            'tingkat' => 'daerah',
            'urutan' => 50,
            'is_system' => false,
            'is_active' => true,
        ]);

        $actor = $this->createAuthorizedUser(
            permissionSlugs: ['matriks.view', 'matriks.update'],
            username: 'admin.daerah.matriks',
            dapukanSlug: 'admin_daerah_matriks_dup',
        );

        $this->actingAs($actor, 'sanctum')
            ->getJson('/api/master/matriks')
            ->assertForbidden();

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/matriks/'.$dapukan->id, [
                'hak_akses_ids' => [],
            ])
            ->assertForbidden();
    }

    public function test_superadmin_can_update_matriks_for_any_dapukan(): void
    {
        $targetDapukan = Dapukan::query()->create([
            'slug' => 'admin_pusat_matriks',
            'nama' => 'Admin Pusat Matriks',
            'tingkat' => 'pusat',
            'urutan' => 51,
            'is_system' => false,
            'is_active' => true,
        ]);

        $actor = $this->createSuperAdminUser('root.matriks');
        $this->grantPermissions($actor, ['matriks.view', 'matriks.update']);

        $menu = \App\Models\Menu::query()->create([
            'slug' => 'matriks-test-menu',
            'nama' => 'Matriks Test Menu',
            'path' => '/matriks-test',
            'icon' => 'box',
            'urutan' => 1,
            'is_active' => true,
        ]);
        $fitur = \App\Models\Fitur::query()->create([
            'menu_id' => $menu->id,
            'slug' => 'matriks-test-fitur',
            'nama' => 'Matriks Test Fitur',
            'is_active' => true,
        ]);
        $hak = \App\Models\HakAkses::query()->create([
            'fitur_id' => $fitur->id,
            'slug' => 'jamaah.view',
            'nama' => 'Lihat Jamaah',
            'aksi' => 'view',
        ]);

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/matriks/'.$targetDapukan->id, [
                'hak_akses_ids' => [$hak->id],
            ])
            ->assertOk()
            ->assertJsonPath('data.id', $targetDapukan->id);
    }

    /**
     * @param  list<string>  $permissionSlugs
     */
    private function createUserForTingkat(
        string $username,
        string $tingkat,
        string $dapukanSlug,
        array $permissionSlugs = [],
    ): User {
        $dapukan = Dapukan::query()->create([
            'slug' => $dapukanSlug,
            'nama' => 'Role '.$tingkat,
            'tingkat' => $tingkat,
            'urutan' => 60,
            'is_system' => false,
            'is_active' => true,
        ]);

        if ($permissionSlugs !== []) {
            $menu = \App\Models\Menu::query()->create([
                'slug' => 'test-menu-'.$dapukanSlug,
                'nama' => 'Test Menu',
                'path' => '/test',
                'icon' => 'box',
                'urutan' => 1,
                'is_active' => true,
            ]);

            $fitur = \App\Models\Fitur::query()->create([
                'menu_id' => $menu->id,
                'slug' => 'test-fitur-'.$dapukanSlug,
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

            $dapukan->hakAkses()->sync($hakIds);
        }

        return User::createManaged([
            'name' => 'User '.$tingkat,
            'username' => $username,
            'email' => $username.'@sijama.test',
            'password' => 'password',
            'dapukan_id' => $dapukan->id,
            'is_active' => true,
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
