<?php

namespace App\Services;

use App\Http\Resources\MenuResource;
use App\Models\Menu;
use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class MenuService
{
    public function list(?string $q = null, ?int $perPage = null, ?int $page = null): LengthAwarePaginator
    {
        $builder = Menu::query()->orderBy('urutan')->orderBy('nama');

        if ($q) {
            $builder->where(function ($query) use ($q) {
                $query->where('kode', 'ilike', "%{$q}%")
                    ->orWhere('nama', 'ilike', "%{$q}%");
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): MenuResource
    {
        $menu = Menu::create($data);

        return new MenuResource($menu);
    }

    public function find(int $id): MenuResource
    {
        return new MenuResource($this->findModel($id));
    }

    public function update(int $id, array $data): MenuResource
    {
        $menu = $this->findModel($id);
        $menu->update($data);

        return new MenuResource($menu->fresh());
    }

    public function delete(int $id): void
    {
        $menu = $this->findModel($id);

        if ($menu->children()->exists()) {
            throw ValidationException::withMessages([
                'menu' => ['Menu masih memiliki submenu.'],
            ]);
        }

        $menu->delete();
    }

    private function findModel(int $id): Menu
    {
        $menu = Menu::find($id);

        if (! $menu) {
            throw new ModelNotFoundException('Menu tidak ditemukan.');
        }

        return $menu;
    }
}
