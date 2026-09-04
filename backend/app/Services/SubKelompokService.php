<?php

namespace App\Services;

use App\Http\Resources\SubKelompokResource;
use App\Models\Kelompok;
use App\Models\SubKelompok;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SubKelompokService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    public function list(
        User $user,
        ?string $query = null,
        ?int $wilayah_fung_kelompokId = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = SubKelompok::query()->with('wilayahFungKelompok');
        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['nama', 'kode', 'is_active'],
            'nama',
        );

        $builder->whereHas('wilayahFungKelompok', function ($q) use ($user) {
            $this->scopeService->applyKelompokScope($q, $user);
        });

        if ($wilayah_fung_kelompokId !== null) {
            $builder->where('wilayah_fung_kelompok_id', $wilayah_fung_kelompokId);
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
        $kelompok = Kelompok::findOrFail($data['wilayah_fung_kelompok_id']);
        $this->scopeService->assertKelompokInScope($user, $kelompok);

        $item = SubKelompok::create($data);

        return new SubKelompokResource($item->load('wilayahFungKelompok'));
    }

    public function find(int $id, User $user): SubKelompokResource
    {
        $item = $this->findModel($id);
        $this->scopeService->assertKelompokInScope($user, $item->wilayahFungKelompok);

        return new SubKelompokResource($item->load('wilayahFungKelompok'));
    }

    public function update(int $id, array $data, User $user): SubKelompokResource
    {
        $item = $this->findModel($id);
        $this->scopeService->assertKelompokInScope($user, $item->wilayahFungKelompok);

        if (isset($data['wilayah_fung_kelompok_id'])) {
            $kelompok = Kelompok::findOrFail($data['wilayah_fung_kelompok_id']);
            $this->scopeService->assertKelompokInScope($user, $kelompok);
        }

        $item->update($data);

        return new SubKelompokResource($item->fresh()->load('wilayahFungKelompok'));
    }

    public function delete(int $id, User $user): void
    {
        $item = $this->findModel($id);
        $this->scopeService->assertKelompokInScope($user, $item->wilayahFungKelompok);
        $item->delete();
    }

    private function findModel(int $id): SubKelompok
    {
        $item = SubKelompok::with('wilayahFungKelompok')->find($id);

        if (! $item) {
            throw new ModelNotFoundException('Sub kelompok tidak ditemukan.');
        }

        return $item;
    }
}
