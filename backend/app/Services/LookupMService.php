<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:23:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:23:49
 */

namespace App\Services;

use App\Http\Resources\LookupMResource;
use App\Models\LookupM;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class LookupMService extends SimpleMasterService
{
    protected function modelClass(): string
    {
        return LookupM::class;
    }

    protected function resourceClass(): string
    {
        return LookupMResource::class;
    }

    protected function searchable(): array
    {
        return ['lookup_type', 'lookup_name', 'lookup_value', 'lookup_kode'];
    }

    protected function orderColumn(): string
    {
        return 'lookup_type';
    }

    protected function sortableColumns(): array
    {
        return [
            'lookup_type',
            'lookup_name',
            'nama' => 'lookup_name',
            'lookup_value',
            'lookup_kode',
            'lookup_urutan',
            'is_active',
        ];
    }

    protected function prepare(array $data): array
    {
        unset($data['is_deleted'], $data['deleted_date'], $data['deleted_by']);

        return $data;
    }

    public function list(
        ?string $query = null,
        ?int $perPage = null,
        ?int $page = null,
        ?bool $activeOnly = null,
        array $extraFilters = [],
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = LookupM::query()->notDeleted();

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            $this->sortableColumns(),
            $this->orderColumn(),
            $this->orderDirection(),
        );

        if (! $sortBy) {
            $builder->orderBy('lookup_urutan')->orderBy('lookup_name');
        }

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
        $payload = $this->prepare($data);
        $payload['created_date'] = now();
        $payload['created_by'] = Auth::id();
        $payload['modified_count'] = 0;
        $payload['is_deleted'] = false;
        $payload['is_active'] = array_key_exists('is_active', $payload)
            ? (bool) $payload['is_active']
            : true;

        $model = LookupM::query()->create($payload);

        return new LookupMResource($model);
    }

    public function update(int $id, array $data): JsonResource
    {
        $model = $this->findModel($id);
        $payload = $this->prepare($data);
        $payload['last_modified_date'] = now();
        $payload['last_modified_by'] = Auth::id();
        $payload['modified_count'] = ((int) $model->modified_count) + 1;
        $model->update($payload);

        return new LookupMResource($model->fresh());
    }

    public function delete(int $id): void
    {
        $model = $this->findModel($id);
        $model->update([
            'is_deleted' => true,
            'is_active' => false,
            'deleted_date' => now(),
            'deleted_by' => Auth::id(),
            'last_modified_date' => now(),
            'last_modified_by' => Auth::id(),
            'modified_count' => ((int) $model->modified_count) + 1,
        ]);
    }

    protected function findModel(int $id): Model
    {
        $model = LookupM::query()->notDeleted()->find($id);

        if (! $model) {
            throw (new ModelNotFoundException)->setModel(LookupM::class, [$id]);
        }

        return $model;
    }
}
