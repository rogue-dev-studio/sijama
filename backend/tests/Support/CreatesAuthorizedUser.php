<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 16:57:14
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 16:57:14
 */

namespace Tests\Support;

use App\Models\Dapukan;
use App\Models\Fitur;
use App\Models\HakAkses;
use App\Models\Menu;
use App\Models\User;

trait CreatesAuthorizedUser
{
    /**
     * @param  list<string>  $permissionSlugs
     */
    protected function createAuthorizedUser(
        array $permissionSlugs = [],
        string $username = 'tester',
        string $dapukanSlug = 'tester_role',
    ): User {
        $dapukan = Dapukan::query()->create([
            'slug' => $dapukanSlug,
            'nama' => 'Tester Role',
            'tingkat' => 'kelompok',
            'urutan' => 99,
            'is_system' => false,
            'is_active' => true,
        ]);

        if ($permissionSlugs !== []) {
            $menu = Menu::query()->create([
                'slug' => 'test-menu-'.$dapukanSlug,
                'nama' => 'Test Menu',
                'path' => '/test',
                'icon' => 'box',
                'urutan' => 1,
                'is_active' => true,
            ]);

            $fitur = Fitur::query()->create([
                'menu_id' => $menu->id,
                'slug' => 'test-fitur-'.$dapukanSlug,
                'nama' => 'Test Fitur',
                'is_active' => true,
            ]);

            $hakIds = [];
            foreach ($permissionSlugs as $slug) {
                $hak = HakAkses::query()->create([
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
            'name' => 'Tester',
            'username' => $username,
            'email' => $username.'@sijama.test',
            'password' => 'password',
            'dapukan_id' => $dapukan->id,
            'is_active' => true,
        ]);
    }
}
