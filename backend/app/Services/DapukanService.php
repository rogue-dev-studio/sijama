<?php

namespace App\Services;

use App\Http\Resources\DapukanResource;
use App\Models\Dapukan;
use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class DapukanService
{
    public function list(?string $q = null, ?int $perPage = null, ?int $page = null): LengthAwarePaginator
    {
        $builder = Dapukan::query()->orderBy('urutan')->orderBy('nama');

        if ($q) {
            $builder->where(function ($query) use ($q) {
                $query->where('kode', 'ilike', "%{$q}%")
                    ->orWhere('nama', 'ilike', "%{$q}%");
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
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

        if (array_key_exists('kode', $data) && $data['kode'] !== $dapukan->kode) {
            throw ValidationException::withMessages([
                'kode' => ['Kode dapukan sistem tidak dapat diubah.'],
            ]);
        }

        if (array_key_exists('is_system', $data) && ! $data['is_system']) {
            throw ValidationException::withMessages([
                'is_system' => ['Status sistem dapukan bawaan tidak dapat diubah.'],
            ]);
        }
    }
}
