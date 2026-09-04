<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 13:13:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 13:13:00
 */

namespace Tests\Feature;

use App\Models\Dapukan;
use App\Models\Fitur;
use App\Models\HakAkses;
use App\Models\Menu;
use App\Models\User;
use App\Support\SuperAdminAccess;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_rbac_seeder_creates_reserved_superadmin_user_with_full_access(): void
    {
        $this->seed(RbacSeeder::class);

        $admin = User::query()->where('username', SuperAdminAccess::RESERVED_USERNAME)->first();
        $this->assertNotNull($admin);
        $this->assertTrue($admin->isSuperAdmin());
        $this->assertTrue($admin->is_active);

        $allSlugs = HakAkses::query()->orderBy('slug')->pluck('slug')->all();
        $this->assertNotEmpty($allSlugs);
        $this->assertSame($allSlugs, $admin->permissionCodes());
        $this->assertSame(
            count($allSlugs),
            Dapukan::query()->where('slug', SuperAdminAccess::DAPUKAN_SLUG)->firstOrFail()->hakAkses()->count(),
        );
    }

    public function test_new_hak_akses_is_granted_to_superadmin_automatically(): void
    {
        $this->seed(RbacSeeder::class);

        $menu = Menu::query()->create([
            'slug' => 'master-uji-superadmin',
            'nama' => 'Uji Superadmin',
            'path' => '/master/uji-superadmin',
            'icon' => 'box',
            'urutan' => 99,
            'is_active' => true,
        ]);
        $fitur = Fitur::query()
            ->where('menu_id', $menu->id)
            ->where('slug', 'master-uji-superadmin')
            ->firstOrFail();
        $hak = HakAkses::query()->create([
            'fitur_id' => $fitur->id,
            'slug' => 'uji_superadmin.view',
            'nama' => 'Lihat Uji Superadmin',
            'aksi' => 'view',
        ]);

        $superadmin = Dapukan::query()->where('slug', SuperAdminAccess::DAPUKAN_SLUG)->firstOrFail();
        $this->assertTrue($superadmin->hakAkses()->whereKey($hak->id)->exists());

        $admin = User::query()->where('username', SuperAdminAccess::RESERVED_USERNAME)->firstOrFail();
        $this->assertContains('uji_superadmin.view', $admin->permissionCodes());
    }

    public function test_matriks_cannot_reduce_superadmin_grants(): void
    {
        $this->seed(RbacSeeder::class);

        $actor = User::query()->where('username', SuperAdminAccess::RESERVED_USERNAME)->firstOrFail();
        $dapukan = Dapukan::query()->where('slug', SuperAdminAccess::DAPUKAN_SLUG)->firstOrFail();
        $before = $dapukan->hakAkses()->count();
        $this->assertGreaterThan(0, $before);

        $keepId = (int) $dapukan->hakAkses()->value('id');

        $this->actingAs($actor, 'sanctum')
            ->putJson('/api/master/matriks/'.$dapukan->id, [
                'hak_akses_ids' => [$keepId],
            ])
            ->assertOk();

        $this->assertSame($before, $dapukan->fresh()->hakAkses()->count());
    }

    public function test_last_active_superadmin_cannot_be_deactivated(): void
    {
        $this->seed(RbacSeeder::class);

        $admin = User::query()->where('username', SuperAdminAccess::RESERVED_USERNAME)->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/master/users/'.$admin->id.'/deactivate')
            ->assertStatus(422);
    }

    public function test_new_menu_is_provisioned_and_visible_to_superadmin(): void
    {
        $this->seed(RbacSeeder::class);

        $menu = Menu::query()->create([
            'slug' => 'master-link-baru',
            'nama' => 'Link Baru',
            'path' => '/master/link-baru',
            'icon' => 'link',
            'urutan' => 80,
            'is_active' => true,
        ]);

        $this->assertTrue(
            Fitur::query()->where('menu_id', $menu->id)->where('slug', 'master-link-baru')->exists(),
        );
        $this->assertTrue(HakAkses::query()->where('slug', 'master_link_baru.view')->exists());

        $admin = User::query()->where('username', SuperAdminAccess::RESERVED_USERNAME)->firstOrFail();
        $this->assertContains('master_link_baru.view', $admin->permissionCodes());

        $login = $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'password',
        ]);
        $login->assertOk();
        $this->assertTrue($this->menusContainPath($login->json('data.menus'), '/master/link-baru'));
    }

    public function test_superadmin_bypasses_route_permission_middleware(): void
    {
        $this->seed(RbacSeeder::class);

        $admin = User::query()->where('username', SuperAdminAccess::RESERVED_USERNAME)->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/master/materi')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    /**
     * @param  list<array<string, mixed>>  $menus
     */
    private function menusContainPath(array $menus, string $path): bool
    {
        foreach ($menus as $menu) {
            if (($menu['path'] ?? null) === $path) {
                return true;
            }
            if (isset($menu['children']) && $this->menusContainPath($menu['children'], $path)) {
                return true;
            }
        }

        return false;
    }
}
