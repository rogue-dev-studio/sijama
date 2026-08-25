<?php

namespace App\Services;

use App\Http\Resources\DapukanResource;
use App\Models\Dapukan;
use App\Models\User;
use App\Support\DapukanTingkat;
use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class DapukanService
{
    public function list(?string $q = null, ?int $perPage = null, ?int $page = null): LengthAwarePaginator
    {
        $builder = Dapukan::query()->orderBy('urutan')->orderBy('nama');

        if ($q) {
            $builder->where(function ($query) use ($q) {
                $query->where('slug', 'ilike', "%{$q}%")
                    ->orWhere('nama', 'ilike', "%{$q}%");
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    /**
     * @return list<array{id: int, slug: string, nama: string, tingkat: string}>
     */
    public function listForJamaahForm(User $user): array
    {
        if (! $this->canAssignJamaahDapukan($user)) {
            return [];
        }

        $builder = Dapukan::query()
            ->where('is_active', true)
            ->where('slug', '!=', 'superadmin')
            ->orderBy('urutan')
            ->orderBy('nama');

        $this->applyAssignableTingkatFilter($builder, $user);

        return $builder
            ->get(['id', 'slug', 'nama', 'tingkat'])
            ->map(fn (Dapukan $item) => [
                'id' => $item->id,
                'slug' => $item->slug,
                'nama' => $item->nama,
                'tingkat' => $item->tingkat,
            ])
            ->values()
            ->all();
    }

    public function canAssignJamaahDapukan(User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->effectiveDapukan()->contains(
            fn (Dapukan $item) => DapukanTingkat::isAdminSlug($item->slug)
        );
    }

    public function isAssignableByUser(User $user, Dapukan $dapukan): bool
    {
        if (! $this->canAssignJamaahDapukan($user)) {
            return false;
        }

        if ($dapukan->slug === 'superadmin') {
            return false;
        }

        if ($user->isSuperAdmin() || $user->primaryDapukan()?->tingkat === 'global') {
            return true;
        }

        return DapukanTingkat::isAssignableBy(
            $dapukan->tingkat,
            $user->primaryDapukan()?->tingkat
        );
    }

    private function applyAssignableTingkatFilter(Builder $builder, User $user): void
    {
        if ($user->isSuperAdmin() || $user->primaryDapukan()?->tingkat === 'global') {
            return;
        }

        $allowed = DapukanTingkat::tingkatAtOrBelow($user->primaryDapukan()?->tingkat);

        if ($allowed === []) {
            $builder->whereKey([]);

            return;
        }

        $builder->whereIn('tingkat', $allowed);
    }

    public function create(array $data): DapukanResource
    {
        $dapukan = Dapukan::create($data);

        return new DapukanResource($dapukan);
    }

    public function find(int $id): DapukanResource
    {
        return new DapukanResource($this->findModel($id));
    }

    public function update(int $id, array $data): DapukanResource
    {
        $dapukan = $this->findModel($id);
        $this->guardSystemMutation($dapukan, $data);
        $dapukan->update($data);

        return new DapukanResource($dapukan->fresh());
    }

    public function delete(int $id): void
    {
        $dapukan = $this->findModel($id);

        if ($dapukan->is_system) {
            throw ValidationException::withMessages([
                'dapukan' => ['Dapukan sistem tidak dapat dihapus.'],
            ]);
        }

        if ($dapukan->users()->exists()) {
            throw ValidationException::withMessages([
                'dapukan' => ['Dapukan masih digunakan oleh pengguna.'],
            ]);
        }

        $dapukan->delete();
    }

    private function findModel(int $id): Dapukan
    {
        $dapukan = Dapukan::find($id);

        if (! $dapukan) {
            throw new ModelNotFoundException('Dapukan tidak ditemukan.');
        }

        return $dapukan;
    }

    private function guardSystemMutation(Dapukan $dapukan, array $data): void
    {
        if (! $dapukan->is_system) {
            return;
        }

        if (array_key_exists('slug', $data) && $data['slug'] !== $dapukan->slug) {
            throw ValidationException::withMessages([
                'slug' => ['Slug dapukan sistem tidak dapat diubah.'],
            ]);
        }

        if (array_key_exists('is_system', $data) && ! $data['is_system']) {
            throw ValidationException::withMessages([
                'is_system' => ['Status sistem dapukan bawaan tidak dapat diubah.'],
            ]);
        }
    }
}
