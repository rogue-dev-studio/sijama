<?php

namespace App\Services;

use App\Http\Resources\KelompokResource;
use App\Models\Desa;
use App\Models\Kelompok;
use App\Models\User;
use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class KelompokService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    public function list(
        User $user,
        ?string $query = null,
        ?int $desaId = null,
        ?int $daerahId = null,
        ?bool $isActive = null,
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $builder = Kelompok::query()->with('desa')->orderBy('nama');
        $this->scopeService->applyKelompokScope($builder, $user);

        if ($desaId !== null) {
            $builder->where('desa_id', $desaId);
        } elseif ($daerahId !== null) {
            $builder->whereHas('desa', fn ($q) => $q->where('daerah_id', $daerahId));
        }

        if ($isActive !== null) {
            $builder->where('is_active', $isActive);
        }

        if ($query) {
            $builder->where(function ($q) use ($query) {
                $q->where('nama', 'ilike', "%{$query}%")
                    ->orWhere('kode', 'ilike', "%{$query}%");
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data, User $user): KelompokResource
    {
        $desa = Desa::findOrFail($data['desa_id']);
        $this->scopeService->assertDesaInScope($user, $desa);

        $kelompok = Kelompok::create($data);

        return new KelompokResource($kelompok->load('desa'));
    }

    public function find(int $id, User $user): KelompokResource
    {
        $kelompok = $this->findModel($id);
        $this->scopeService->assertKelompokInScope($user, $kelompok);

        return new KelompokResource($kelompok->load('desa'));
    }

    public function update(int $id, array $data, User $user): KelompokResource
    {
        $kelompok = $this->findModel($id);
        $this->scopeService->assertKelompokInScope($user, $kelompok);

        if (isset($data['desa_id'])) {
            $desa = Desa::findOrFail($data['desa_id']);
            $this->scopeService->assertDesaInScope($user, $desa);
        }

        $kelompok->update($data);

        return new KelompokResource($kelompok->fresh()->load('desa'));
    }

    public function delete(int $id, User $user): void
    {
        $kelompok = $this->findModel($id);
        $this->scopeService->assertKelompokInScope($user, $kelompok);

        if ($kelompok->jamaah()->withTrashed()->exists()) {
            throw ValidationException::withMessages([
                'kelompok' => ['Kelompok masih memiliki jamaah terkait (termasuk yang diarsipkan).'],
            ]);
        }

        $kelompok->delete();
    }

    private function findModel(int $id): Kelompok
    {
        $kelompok = Kelompok::find($id);

        if (! $kelompok) {
            throw new ModelNotFoundException('Kelompok tidak ditemukan.');
        }

        return $kelompok;
    }
}
