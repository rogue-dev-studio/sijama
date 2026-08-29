<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

namespace App\Services;

use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Validation\ValidationException;

abstract class SimpleMasterService
{
    abstract protected function modelClass(): string;

    abstract protected function resourceClass(): string;

    /** @return list<string> */
    abstract protected function searchable(): array;

    protected function orderColumn(): string
    {
        return 'nama';
    }

    protected function orderDirection(): string
    {
        return 'asc';
    }

    /**
     * Kolom yang boleh di-sort dari query `sort_by`.
     * Boleh list string atau map request-key => sql-column.
     *
     * @return array<string, string>|list<string>
     */
    protected function sortableColumns(): array
    {
        return ['nama', 'is_active'];
    }

    /** @return list<string> */
    protected function withRelations(): array
    {
        return [];
    }

    protected function prepare(array $data): array
    {
        return $data;
    }

    protected function assertDeletable(Model $model): void {}

    public function list(
        ?string $query = null,
        ?int $perPage = null,
        ?int $page = null,
        ?bool $activeOnly = null,
        array $extraFilters = [],
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $class = $this->modelClass();
        $builder = $class::query()->with($this->withRelations());

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            $this->sortableColumns(),
            $this->orderColumn(),
            $this->orderDirection(),
        );

        if ($activeOnly !== null) {
            $builder->where('is_active', $activeOnly);
        }

        foreach ($extraFilters as $column => $value) {
            if ($value !== null && $value !== '') {
                $builder->where($column, $value);
            }
        }

        if ($query) {
            SearchHelper::likeGroup($builder, $this->searchable(), $query);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): JsonResource
    {
        $class = $this->modelClass();
        $resource = $this->resourceClass();
        $model = $class::create($this->prepare($data));

        return new $resource($model->load($this->withRelations()));
    }

    public function find(int $id): JsonResource
    {
        $resource = $this->resourceClass();

        return new $resource($this->findModel($id)->load($this->withRelations()));
    }

    public function update(int $id, array $data): JsonResource
    {
        $resource = $this->resourceClass();
        $model = $this->findModel($id);
        $model->update($this->prepare($data));

        return new $resource($model->fresh()->load($this->withRelations()));
    }

    public function delete(int $id): void
    {
        $model = $this->findModel($id);
        $this->assertDeletable($model);
        $model->delete();
    }

    protected function findModel(int $id): Model
    {
        $class = $this->modelClass();
        $model = $class::query()->find($id);

        if (! $model) {
            throw (new ModelNotFoundException)->setModel($class, [$id]);
        }

        return $model;
    }

    protected function denyDeleteIfRelated(Model $model, string $relation, string $message): void
    {
        if ($model->{$relation}()->exists()) {
            throw ValidationException::withMessages([
                'id' => [$message],
            ]);
        }
    }
}
