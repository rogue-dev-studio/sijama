<?php

namespace App\Services;

use App\Http\Resources\KelompokResource;
use App\Models\Desa;
use App\Models\Kelompok;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class KelompokService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    public function list(
        User $user,
        ?string $query = null,
        ?int $wilayah_fung_desa_id = null,
        ?int $wilayah_fung_daerah_id = null,
        ?bool $isActive = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = Kelompok::query()->with('wilayahFungDesa');
        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['nama', 'kode', 'is_active'],
            'nama',
        );
        $this->scopeService->applyKelompokScope($builder, $user);

        if ($wilayah_fung_desa_id !== null) {
            $builder->where('wilayah_fung_desa_id', $wilayah_fung_desa_id);
        } elseif ($wilayah_fung_daerah_id !== null) {
            $builder->whereHas('wilayahFungDesa', fn ($q) => $q->where('wilayah_fung_daerah_id', $wilayah_fung_daerah_id));
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

    /**
     * @return list<array{
     *   id: int,
     *   wilayah_fung_desa_id: int,
     *   kode: string|null,
     *   nama: string,
     *   wilayah_fung_desa: array{id: int, kode: string, nama: string, wilayah_fung_daerah_id: int}|null
     * }>
     */
    public function listForJamaahForm(User $user): array
    {
        $builder = Kelompok::query()
            ->with(['wilayahFungDesa:id,kode,nama,wilayah_fung_daerah_id'])
            ->where('is_active', true)
            ->orderBy(
                Desa::query()
                    ->select('kode')
                    ->whereColumn('wilayah_fung_desa_m.id', 'wilayah_fung_kelompok_m.wilayah_fung_desa_id')
                    ->limit(1)
            )
            ->orderBy('nama');

        $this->scopeService->applyKelompokScope($builder, $user);

        return $builder
            ->get(['id', 'wilayah_fung_desa_id', 'kode', 'nama'])
            ->map(fn (Kelompok $item) => [
                'id' => $item->id,
                'wilayah_fung_desa_id' => $item->wilayah_fung_desa_id,
                'kode' => $item->kode,
                'nama' => $item->nama,
                'wilayah_fung_desa' => $item->wilayahFungDesa ? [
                    'id' => $item->wilayahFungDesa->id,
                    'kode' => $item->wilayahFungDesa->kode,
                    'nama' => $item->wilayahFungDesa->nama,
                    'wilayah_fung_daerah_id' => $item->wilayahFungDesa->wilayah_fung_daerah_id,
                ] : null,
            ])
            ->values()
            ->all();
    }

    public function create(array $data, User $user): KelompokResource
    {
        $desa = Desa::findOrFail($data['wilayah_fung_desa_id']);
        $this->scopeService->assertDesaInScope($user, $desa);

        $kelompok = Kelompok::create($data);

        return new KelompokResource($kelompok->load('wilayahFungDesa'));
    }

    public function find(int $id, User $user): KelompokResource
    {
        $kelompok = $this->findModel($id);
        $this->scopeService->assertKelompokInScope($user, $kelompok);

        return new KelompokResource($kelompok->load('wilayahFungDesa'));
    }

    public function update(int $id, array $data, User $user): KelompokResource
    {
        $kelompok = $this->findModel($id);
        $this->scopeService->assertKelompokInScope($user, $kelompok);

        if (isset($data['wilayah_fung_desa_id'])) {
            $desa = Desa::findOrFail($data['wilayah_fung_desa_id']);
            $this->scopeService->assertDesaInScope($user, $desa);
        }

        $kelompok->update($data);

        return new KelompokResource($kelompok->fresh()->load('wilayahFungDesa'));
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
