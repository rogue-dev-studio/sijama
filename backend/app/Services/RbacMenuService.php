<?php

namespace App\Services;

use App\Models\Menu;
use App\Models\User;

class RbacMenuService
{
    public function getAccessibleMenus(User $user): array
    {
        $menus = Menu::query()
            ->where('is_active', true)
            ->with([
                'fiturs.hakAkses',
                'children' => fn ($query) => $query->where('is_active', true)->orderBy('urutan'),
                'children.fiturs.hakAkses',
                'children.children' => fn ($query) => $query->where('is_active', true)->orderBy('urutan'),
                'children.children.fiturs.hakAkses',
                'children.children.children' => fn ($query) => $query->where('is_active', true)->orderBy('urutan'),
                'children.children.children.fiturs.hakAkses',
            ])
            ->whereNull('parent_id')
            ->orderBy('urutan')
            ->get();

        $permissionCodes = $user->permissionCodes();

        return $menus
            ->map(fn (Menu $menu) => $this->buildMenuNode($menu, $permissionCodes))
            ->filter()
            ->values()
            ->all();
    }

    private function buildMenuNode(Menu $menu, array $permissionCodes): ?array
    {
        $children = $menu->children
            ->filter(fn (Menu $child) => $child->is_active)
            ->sortBy('urutan')
            ->map(fn (Menu $child) => $this->buildMenuNode($child, $permissionCodes))
            ->filter()
            ->values()
            ->all();

        $hasChildAccess = count($children) > 0;

        // Folder / section: tampil hanya jika ada anak yang diizinkan matriks.
        if ($menu->path === null) {
            if (! $hasChildAccess) {
                return null;
            }

            return [
                'id' => $menu->id,
                'slug' => $menu->slug,
                'nama' => $menu->nama,
                'path' => $menu->path,
                'icon' => $menu->icon,
                'children' => $children,
            ];
        }

        if ($this->menuHasViewPermission($menu, $permissionCodes)) {
            return [
                'id' => $menu->id,
                'slug' => $menu->slug,
                'nama' => $menu->nama,
                'path' => $menu->path,
                'icon' => $menu->icon,
                'children' => $children,
            ];
        }

        return null;
    }

    private function menuHasViewPermission(Menu $menu, array $permissionCodes): bool
    {
        foreach ($menu->fiturs as $fitur) {
            foreach ($fitur->hakAkses as $hakAkses) {
                if ($hakAkses->aksi !== 'view') {
                    continue;
                }

                if (in_array($hakAkses->slug, $permissionCodes, true)) {
                    return true;
                }
            }
        }

        return false;
    }
}
