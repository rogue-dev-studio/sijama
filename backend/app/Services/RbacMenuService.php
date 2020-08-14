<?php

namespace App\Services;

use App\Models\Menu;
use App\Models\User;
use Illuminate\Support\Collection;

class RbacMenuService
{
    public function getAccessibleMenus(User $user): array
    {
        $menus = Menu::query()
            ->where('is_active', true)
            ->with([
                'fiturs.hakAkses',
                'children.fiturs.hakAkses',
                'children.children.fiturs.hakAkses',
                'children.children.children.fiturs.hakAkses',
            ])
            ->whereNull('parent_id')
            ->orderBy('urutan')
            ->get();

        $permissionCodes = $user->permissionCodes();

        return $menus
            ->map(fn (Menu $menu) => $this->buildMenuNode($menu, $permissionCodes, $user))
            ->filter()
            ->values()
            ->all();
    }

    private function buildMenuNode(Menu $menu, array $permissionCodes, User $user): ?array
    {
        $children = $menu->children
            ->map(fn (Menu $child) => $this->buildMenuNode($child, $permissionCodes, $user))
            ->filter()
            ->values()
            ->all();

        $hasDirectPermission = $this->menuHasPermission($menu, $permissionCodes, $user);
        $hasChildAccess = count($children) > 0;

        if (! $hasDirectPermission && ! $hasChildAccess) {
            return null;
        }

        return [
            'id' => $menu->id,
            'kode' => $menu->kode,
            'nama' => $menu->nama,
            'path' => $menu->path,
            'icon' => $menu->icon,
            'children' => $children,
        ];
    }

    private function menuHasPermission(Menu $menu, array $permissionCodes, User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return $menu->fiturs->isNotEmpty() || $menu->path === null;
        }

        foreach ($menu->fiturs as $fitur) {
            foreach ($fitur->hakAkses as $hakAkses) {
                if (in_array($hakAkses->kode, $permissionCodes, true)) {
                    return true;
                }
            }
        }

        return false;
    }
}
