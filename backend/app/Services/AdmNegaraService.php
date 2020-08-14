<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:39:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:39:00
 */

namespace App\Services;

use App\Http\Resources\AdmNegaraResource;
use App\Models\AdmNegara;
use App\Support\PaginationHelper;
use App\Support\SearchHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class AdmNegaraService
{
    public function list(?string $query = null, ?int $perPage = null, ?int $page = null): LengthAwarePaginator
    {
        $builder = AdmNegara::query()->orderBy('nama');

        if ($query) {
            SearchHelper::likeGroup($builder, ['nama', 'kode'], $query);
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data): AdmNegaraResource
    {
        return new AdmNegaraResource(AdmNegara::create($data));
    }

    public function find(int $id): AdmNegaraResource
    {
        return new AdmNegaraResource($this->findModel($id));
    }

    public function update(int $id, array $data): AdmNegaraResource
    {
        $negara = $this->findModel($id);
        $negara->update($data);

        return new AdmNegaraResource($negara->fresh());
    }

    public function delete(int $id): void
    {
        $negara = $this->findModel($id);

        if ($negara->provinsi()->exists()) {
            throw ValidationException::withMessages([
                'adm_negara' => ['Negara masih memiliki provinsi terkait.'],
            ]);
        }

        $negara->delete();
    }

    private function findModel(int $id): AdmNegara
    {
        $negara = AdmNegara::find($id);

        if (! $negara) {
            throw new ModelNotFoundException('Negara tidak ditemukan.');
        }

        return $negara;
    }
}
