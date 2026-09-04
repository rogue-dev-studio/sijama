<?php

namespace App\Services;

use App\Models\Menu;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class RbacMenuService
{
    private const FULL_TREE_CACHE_KEY = 'rbac.menu_tree.full';

    private const FULL_TREE_TTL_SECONDS = 3600;

    public function getAccessibleMenus(User $user): array
    {
        if ($user->isSuperAdmin()) {
            return $this->getFullMenuTree();
        }

        $permissionSet = array_flip($user->permissionCodes());

        $menus = Menu::query()
            ->where('is_active', true)
            ->with([
                'fiturs.hakAkses' => fn ($query) => $query->where('aksi', 'view'),
                'children' => fn ($query) => $query->where('is_active', true)->orderBy('urutan'),
                'children.fiturs.hakAkses' => fn ($query) => $query->where('aksi', 'view'),
                'children.children' => fn ($query) => $query->where('is_active', true)->orderBy('urutan'),
                'children.children.fiturs.hakAkses' => fn ($query) => $query->where('aksi', 'view'),
                'children.children.children' => fn ($query) => $query->where('is_active', true)->orderBy('urutan'),
                'children.children.children.fiturs.hakAkses' => fn ($query) => $query->where('aksi', 'view'),
            ])
            ->whereNull('parent_id')
            ->orderBy('urutan')
            ->get();

        return $menus
            ->map(fn (Menu $menu) => $this->buildMenuNode($menu, $permissionSet))
            ->filter()
            ->values()
            ->all();
    }

    public static function forgetFullMenuTreeCache(): void
    {
        try {
            Cache::forget(self::FULL_TREE_CACHE_KEY);
        } catch (\Throwable) {
            // ignore cache driver failures
        }
    }

    /** @return list<array<string, mixed>> */
    private function getFullMenuTree(): array
    {
        return Cache::remember(self::FULL_TREE_CACHE_KEY, self::FULL_TREE_TTL_SECONDS, function () {
            $menus = Menu::query()
                ->where('is_active', true)
                ->with([
                    'children' => fn ($query) => $query->where('is_active', true)->orderBy('urutan'),
                    'children.children' => fn ($query) => $query->where('is_active', true)->orderBy('urutan'),
                    'children.children.children' => fn ($query) => $query->where('is_active', true)->orderBy('urutan'),
                ])
                ->whereNull('parent_id')
                ->orderBy('urutan')
                ->get();

            return $menus
                ->map(fn (Menu $menu) => $this->buildFullMenuNode($menu))
                ->filter()
                ->values()
                ->all();
        });
    }

    private function buildFullMenuNode(Menu $menu): ?array
    {
        $children = $menu->children
            ->filter(fn (Menu $child) => $child->is_active)
            ->sortBy('urutan')
            ->map(fn (Menu $child) => $this->buildFullMenuNode($child))
            ->filter()
            ->values()
            ->all();

        if ($menu->path === null) {
            if ($children === []) {
                return null;
            }

            return $this->menuNodeArray($menu, $children);
        }

        return $this->menuNodeArray($menu, $children);
    }

    /** @param  array<string, int>  $permissionSet */
    private function buildMenuNode(Menu $menu, array $permissionSet): ?array
    {
        $children = $menu->children
            ->filter(fn (Menu $child) => $child->is_active)
            ->sortBy('urutan')
            ->map(fn (Menu $child) => $this->buildMenuNode($child, $permissionSet))
            ->filter()
            ->values()
            ->all();

        $hasChildAccess = count($children) > 0;

        if ($menu->path === null) {
            if (! $hasChildAccess) {
                return null;
            }

            return $this->menuNodeArray($menu, $children);
        }

        if ($this->menuHasViewPermission($menu, $permissionSet)) {
            return $this->menuNodeArray($menu, $children);
        }

        return null;
    }

    /** @param  array<string, int>  $permissionSet */
    private function menuHasViewPermission(Menu $menu, array $permissionSet): bool
    {
        foreach ($menu->fiturs as $fitur) {
            foreach ($fitur->hakAkses as $hakAkses) {
                if (isset($permissionSet[$hakAkses->slug])) {
                    return true;
                }
            }
        }

        return false;
    }

    /** @param  list<array<string, mixed>>  $children */
    private function menuNodeArray(Menu $menu, array $children): array
    {
        return [
            'id' => $menu->id,
            'slug' => $menu->slug,
            'nama' => $menu->nama,
            'path' => $menu->path,
            'icon' => $menu->icon,
            'children' => $children,
        ];
    }
}
