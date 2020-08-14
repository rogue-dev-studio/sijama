<?php

namespace App\Services;

use App\Http\Resources\SubKelompokResource;
use App\Models\Kelompok;
use App\Models\SubKelompok;
use App\Models\User;
use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SubKelompokService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    public function list(
        User $user,
        ?string $query = null,
        ?int $kelompokId = null,
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $builder = SubKelompok::query()->with('kelompok')->orderBy('nama');

        $builder->whereHas('kelompok', function ($q) use ($user) {
            $this->scopeService->applyKelompokScope($q, $user);
        });

        if ($kelompokId !== null) {
            $builder->where('kelompok_id', $kelompokId);
        }

        if ($query) {
            $builder->where(function ($q) use ($query) {
                $q->where('nama', 'ilike', "%{$query}%")
                    ->orWhere('kode', 'ilike', "%{$query}%");
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data, User $user): SubKelompokResource
    {
        $kelompok = Kelompok::findOrFail($data['kelompok_id']);
        $this->scopeService->assertKelompokInScope($user, $kelompok);

        $item = SubKelompok::create($data);

        return new SubKelompokResource($item->load('kelompok'));
    }

    public function find(int $id, User $user): SubKelompokResource
    {
        $item = $this->findModel($id);
        $this->scopeService->assertKelompokInScope($user, $item->kelompok);

        return new SubKelompokResource($item->load('kelompok'));
    }

    public function update(int $id, array $data, User $user): SubKelompokResource
    {
        $item = $this->findModel($id);
        $this->scopeService->assertKelompokInScope($user, $item->kelompok);

        if (isset($data['kelompok_id'])) {
            $kelompok = Kelompok::findOrFail($data['kelompok_id']);
            $this->scopeService->assertKelompokInScope($user, $kelompok);
        }

        $item->update($data);

        return new SubKelompokResource($item->fresh()->load('kelompok'));
    }

    public function delete(int $id, User $user): void
    {
        $item = $this->findModel($id);
        $this->scopeService->assertKelompokInScope($user, $item->kelompok);
        $item->delete();
    }

    private function findModel(int $id): SubKelompok
    {
        $item = SubKelompok::with('kelompok')->find($id);

        if (! $item) {
            throw new ModelNotFoundException('Sub kelompok tidak ditemukan.');
        }

        return $item;
    }
}
