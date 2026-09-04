<?php

namespace App\Services;

use App\Http\Resources\DaerahResource;
use App\Models\Daerah;
use App\Models\Pusat;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class DaerahService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    public function list(
        User $user,
        ?string $query = null,
        ?int $pusatId = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = Daerah::query()->with('wilayahFungPusat');
        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['nama', 'kode', 'is_active'],
            'nama',
        );
        $this->scopeService->applyDaerahScope($builder, $user);

        if ($pusatId !== null) {
            $builder->where('wilayah_fung_pusat_id', $pusatId);
        }

        if ($query) {
            SearchHelper::likeGroup($builder, ['nama', 'kode'], $query);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data, User $user): DaerahResource
    {
        $pusat = Pusat::findOrFail($data['wilayah_fung_pusat_id']);
        $this->scopeService->assertPusatInScope($user, $pusat);

        $daerah = Daerah::create($data);

        return new DaerahResource($daerah->load('wilayahFungPusat'));
    }

    public function find(int $id, User $user): DaerahResource
    {
        $daerah = $this->findModel($id);
        $this->scopeService->assertDaerahInScope($user, $daerah);

        return new DaerahResource($daerah->load('wilayahFungPusat'));
    }

    public function update(int $id, array $data, User $user): DaerahResource
    {
        $daerah = $this->findModel($id);
        $this->scopeService->assertDaerahInScope($user, $daerah);

        if (isset($data['wilayah_fung_pusat_id'])) {
            $pusat = Pusat::findOrFail($data['wilayah_fung_pusat_id']);
            $this->scopeService->assertPusatInScope($user, $pusat);
        }

        $daerah->update($data);

        return new DaerahResource($daerah->fresh()->load('wilayahFungPusat'));
    }

    public function delete(int $id, User $user): void
    {
        $daerah = $this->findModel($id);
        $this->scopeService->assertDaerahInScope($user, $daerah);

        if ($daerah->wilayahFungDesa()->exists()) {
            throw ValidationException::withMessages([
                'daerah' => ['Daerah masih memiliki desa terkait.'],
            ]);
        }

        $daerah->delete();
    }

    private function findModel(int $id): Daerah
    {
        $daerah = Daerah::find($id);

        if (! $daerah) {
            throw new ModelNotFoundException('Daerah tidak ditemukan.');
        }

        return $daerah;
    }
}
