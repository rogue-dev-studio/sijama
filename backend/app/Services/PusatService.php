<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:41:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:41:00
 */

namespace App\Services;

use App\Http\Resources\PusatResource;
use App\Models\Pusat;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class PusatService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    public function list(
        User $user,
        ?string $query = null,
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $builder = Pusat::query()->orderBy('nama');
        $this->scopeService->applyPusatScope($builder, $user);

        if ($query) {
            SearchHelper::likeGroup($builder, ['nama', 'kode'], $query);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): PusatResource
    {
        $pusat = Pusat::create($data);

        return new PusatResource($pusat);
    }

    public function find(int $id, User $user): PusatResource
    {
        $pusat = $this->findModel($id);
        $this->scopeService->assertPusatInScope($user, $pusat);

        return new PusatResource($pusat);
    }

    public function update(int $id, array $data, User $user): PusatResource
    {
        $pusat = $this->findModel($id);
        $this->scopeService->assertPusatInScope($user, $pusat);
        $pusat->update($data);

        return new PusatResource($pusat->fresh());
    }

    public function delete(int $id, User $user): void
    {
        $pusat = $this->findModel($id);
        $this->scopeService->assertPusatInScope($user, $pusat);

        if ($pusat->daerah()->exists()) {
            throw ValidationException::withMessages([
                'pusat' => ['Pusat masih memiliki daerah terkait.'],
            ]);
        }

        $pusat->delete();
    }

    private function findModel(int $id): Pusat
    {
        $pusat = Pusat::find($id);

        if (! $pusat) {
            throw new ModelNotFoundException('Pusat tidak ditemukan.');
        }

        return $pusat;
    }
}
