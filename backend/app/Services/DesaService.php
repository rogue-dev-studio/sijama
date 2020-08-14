<?php

namespace App\Services;

use App\Http\Resources\DesaResource;
use App\Models\Daerah;
use App\Models\Desa;
use App\Models\User;
use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class DesaService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    public function list(
        User $user,
        ?string $query = null,
        ?int $daerahId = null,
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $builder = Desa::query()->with('daerah')->orderBy('nama');
        $this->scopeService->applyDesaScope($builder, $user);

        if ($daerahId !== null) {
            $builder->where('daerah_id', $daerahId);
        }

        if ($query) {
            $builder->where(function ($q) use ($query) {
                $q->where('nama', 'ilike', "%{$query}%")
                    ->orWhere('kode', 'ilike', "%{$query}%");
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data, User $user): DesaResource
    {
        $daerah = Daerah::findOrFail($data['daerah_id']);
        $this->scopeService->assertDaerahInScope($user, $daerah);

        $desa = Desa::create($data);

        return new DesaResource($desa->load('daerah'));
    }

    public function find(int $id, User $user): DesaResource
    {
        $desa = $this->findModel($id);
        $this->scopeService->assertDesaInScope($user, $desa);

        return new DesaResource($desa->load('daerah'));
    }

    public function update(int $id, array $data, User $user): DesaResource
    {
        $desa = $this->findModel($id);
        $this->scopeService->assertDesaInScope($user, $desa);

        if (isset($data['daerah_id'])) {
            $daerah = Daerah::findOrFail($data['daerah_id']);
            $this->scopeService->assertDaerahInScope($user, $daerah);
        }

        $desa->update($data);

        return new DesaResource($desa->fresh()->load('daerah'));
    }

    public function delete(int $id, User $user): void
    {
        $desa = $this->findModel($id);
        $this->scopeService->assertDesaInScope($user, $desa);

        if ($desa->kelompok()->exists()) {
            throw ValidationException::withMessages([
                'desa' => ['Desa masih memiliki kelompok terkait.'],
            ]);
        }

        $desa->delete();
    }

    private function findModel(int $id): Desa
    {
        $desa = Desa::find($id);

        if (! $desa) {
            throw new ModelNotFoundException('Desa tidak ditemukan.');
        }

        return $desa;
    }
}
