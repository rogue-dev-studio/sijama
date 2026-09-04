<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 11:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 11:25:00
 */

namespace Tests\Feature;

use App\Models\Dapukan;
use App\Models\HakAkses;
use App\Models\User;
use App\Support\DemoUserGuard;
use Database\Seeders\DemoUsersSeeder;
use Database\Seeders\RbacSeeder;
use Database\Seeders\WilayahSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoUsersSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_users_seeder_creates_reserved_accounts(): void
    {
        $this->seed(RbacSeeder::class);
        $this->seed(WilayahSeeder::class);

        foreach (DemoUserGuard::DEMO_USERNAMES as $username) {
            $this->assertDatabaseHas('users', [
                'username' => $username,
                'is_demo' => true,
                'is_active' => true,
            ]);
        }
    }

    public function test_wilayah_seeder_always_includes_demo_users_without_extra_seeder(): void
    {
        $this->seed(RbacSeeder::class);
        $this->seed(WilayahSeeder::class);

        $this->assertSame(count(DemoUserGuard::DEMO_USERNAMES), User::query()->where('is_demo', true)->count());
    }

    public function test_reserved_demo_username_cannot_be_deleted_after_seed(): void
    {
        $this->seed(RbacSeeder::class);
        $this->seed(WilayahSeeder::class);
        $this->seed(DemoUsersSeeder::class);

        $admin = User::query()->where('username', 'admin')->firstOrFail();

        $this->expectException(\Illuminate\Validation\ValidationException::class);
        $admin->delete();
    }

    public function test_demo_users_seeder_resyncs_dapukan_scope_and_password(): void
    {
        $this->seed(RbacSeeder::class);
        $this->seed(WilayahSeeder::class);
        $this->seed(DemoUsersSeeder::class);

        $user = User::query()->where('username', 'admin.daerah')->firstOrFail();
        $wrongDapukan = Dapukan::query()->where('slug', 'jamaah_kelompok')->firstOrFail();
        $user->updateAttributes([
            'dapukan_id' => $wrongDapukan->id,
            'wilayah_fung_pusat_id' => null,
            'wilayah_fung_daerah_id' => null,
            'is_active' => false,
        ]);

        $this->seed(DemoUsersSeeder::class);

        $user->refresh();
        $expectedDapukan = Dapukan::query()->where('slug', 'admin_daerah')->firstOrFail();

        $this->assertSame($expectedDapukan->id, $user->dapukan_id);
        $this->assertNotNull($user->wilayah_fung_pusat_id);
        $this->assertNotNull($user->wilayah_fung_daerah_id);
        $this->assertTrue($user->is_active);
        $this->assertTrue($user->is_demo);

        $login = $this->postJson('/api/login', [
            'username' => 'admin.daerah',
            'password' => 'password',
        ]);

        $login->assertOk()
            ->assertJsonPath('success', true);

        $permissions = $login->json('data.permissions');
        $this->assertIsArray($permissions);
        $this->assertNotEmpty($permissions);
        $this->assertContains('jamaah.view', $permissions);
    }

    public function test_demo_users_seeder_restores_superadmin_full_access(): void
    {
        $this->seed(RbacSeeder::class);
        $this->seed(WilayahSeeder::class);

        $superadmin = Dapukan::query()->where('slug', 'superadmin')->firstOrFail();
        $superadmin->hakAkses()->sync([]);

        $this->seed(DemoUsersSeeder::class);

        $allSlugs = HakAkses::query()->orderBy('slug')->pluck('slug')->all();
        $this->assertNotEmpty($allSlugs);
        $this->assertSame(
            $allSlugs,
            $superadmin->fresh()->hakAkses()->orderBy('slug')->pluck('slug')->all(),
        );

        $login = $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'password',
        ]);

        $login->assertOk();
        $permissions = $login->json('data.permissions');
        $this->assertSame(['*'], $permissions);
    }

    public function test_every_demo_user_receives_dapukan_permissions(): void
    {
        $this->seed(RbacSeeder::class);
        $this->seed(WilayahSeeder::class);

        foreach (DemoUserGuard::DEMO_USERNAMES as $username) {
            $user = User::query()->where('username', $username)->firstOrFail();
            $this->assertNotEmpty(
                $user->permissionCodes(),
                "Akun demo {$username} tidak punya hak akses.",
            );
        }
    }
}
