<?php

namespace App\Services;

use App\Http\Resources\FiturResource;
use App\Models\Fitur;
use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class FiturService
{
    public function list(
        ?string $q = null,
        ?int $menuId = null,
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $builder = Fitur::query()->with('menu')->orderBy('nama');

        if ($menuId !== null) {
            $builder->where('menu_id', $menuId);
        }

        if ($q) {
            $builder->where(function ($query) use ($q) {
                $query->where('kode', 'ilike', "%{$q}%")
                    ->orWhere('nama', 'ilike', "%{$q}%");
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): FiturResource
    {
        $fitur = Fitur::create($data);

        return new FiturResource($fitur->load('menu'));
    }

    public function find(int $id): FiturResource
    {
        return new FiturResource($this->findModel($id)->load('menu'));
    }

    public function update(int $id, array $data): FiturResource
    {
        $fitur = $this->findModel($id);
        $fitur->update($data);

        return new FiturResource($fitur->fresh()->load('menu'));
    }

    public function delete(int $id): void
    {
        $this->findModel($id)->delete();
    }

    private function findModel(int $id): Fitur
    {
        $fitur = Fitur::find($id);

        if (! $fitur) {
            throw new ModelNotFoundException('Fitur tidak ditemukan.');
        }

        return $fitur;
    }
}
