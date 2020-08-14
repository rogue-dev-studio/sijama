<?php

namespace App\Services;

use App\Http\Resources\HakAksesResource;
use App\Models\HakAkses;
use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class HakAksesService
{
    public function list(
        ?string $q = null,
        ?int $fiturId = null,
        ?int $perPage = null,
        ?int $page = null,
    ): LengthAwarePaginator {
        $builder = HakAkses::query()->with('fitur')->orderBy('kode')->orderBy('nama');

        if ($fiturId !== null) {
            $builder->where('fitur_id', $fiturId);
        }

        if ($q) {
            $builder->where(function ($query) use ($q) {
                $query->where('kode', 'ilike', "%{$q}%")
                    ->orWhere('nama', 'ilike', "%{$q}%");
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): HakAksesResource
    {
        $hakAkses = HakAkses::create($data);

        return new HakAksesResource($hakAkses->load('fitur'));
    }

    public function find(int $id): HakAksesResource
    {
        return new HakAksesResource($this->findModel($id)->load('fitur'));
    }

    public function update(int $id, array $data): HakAksesResource
    {
        $hakAkses = $this->findModel($id);
        $hakAkses->update($data);

        return new HakAksesResource($hakAkses->fresh()->load('fitur'));
    }

    public function delete(int $id): void
    {
        $this->findModel($id)->delete();
    }

    private function findModel(int $id): HakAkses
    {
        $hakAkses = HakAkses::find($id);

        if (! $hakAkses) {
            throw new ModelNotFoundException('Hak akses tidak ditemukan.');
        }

        return $hakAkses;
    }
}
