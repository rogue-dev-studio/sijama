<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

namespace App\Http\Controllers\Api;

use App\DTOs\KeluargaData;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKeluargaRequest;
use App\Http\Requests\UpdateKeluargaRequest;
use App\Http\Resources\KeluargaResource;
use App\Http\Responses\ApiResponse;
use App\Services\KeluargaService;
use App\Support\SortHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KeluargaController extends Controller
{
    public function __construct(private readonly KeluargaService $keluargaService) {}

    public function index(Request $request): JsonResponse
    {
        [$sortBy, $sortDir] = SortHelper::fromRequest($request);

        $paginator = $this->keluargaService->list(
            $request->user(),
            $request->query('q'),
            $request->query('status') ?: null,
            $request->filled('wilayah_fung_kelompok_id') ? $request->integer('wilayah_fung_kelompok_id') : null,
            $request->filled('per_page') ? $request->integer('per_page') : null,
            $request->filled('page') ? $request->integer('page') : null,
            $sortBy,
            $sortDir,
        );

        return ApiResponse::success([
            'items' => KeluargaResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function jamaahOptions(Request $request): JsonResponse
    {
        $items = $this->keluargaService->jamaahOptionsForForm(
            $request->user(),
            $request->filled('wilayah_fung_kelompok_id') ? $request->integer('wilayah_fung_kelompok_id') : null,
            $request->filled('except_keluarga_id') ? $request->integer('except_keluarga_id') : null,
        );

        return ApiResponse::success(
            $items->map(fn ($jamaah) => [
                'id' => $jamaah->id,
                'wilayah_fung_kelompok_id' => $jamaah->wilayah_fung_kelompok_id,
                'nama' => $jamaah->nama,
                'nik' => $jamaah->nik,
                'no_hp' => $jamaah->no_hp,
                'alamat' => $jamaah->alamat,
                'rt' => $jamaah->rt,
                'rw' => $jamaah->rw,
                'wilayah_adm_desa_id' => $jamaah->wilayah_adm_desa_id,
                'kode_pos' => $jamaah->kode_pos,
            ])->values()->all()
        );
    }

    public function store(StoreKeluargaRequest $request): JsonResponse
    {
        $keluarga = $this->keluargaService->create(
            KeluargaData::fromArray($request->validated()),
            $request->user()
        );

        return ApiResponse::success($keluarga, 'Keluarga berhasil ditambahkan', 201);
    }

    public function show(Request $request, int $keluarga): JsonResponse
    {
        return ApiResponse::success($this->keluargaService->find($keluarga, $request->user()));
    }

    public function update(UpdateKeluargaRequest $request, int $keluarga): JsonResponse
    {
        $updated = $this->keluargaService->update(
            $keluarga,
            KeluargaData::fromArray($request->validated()),
            $request->user()
        );

        return ApiResponse::success($updated, 'Keluarga berhasil diperbarui');
    }

    public function destroy(Request $request, int $keluarga): JsonResponse
    {
        $this->keluargaService->delete($keluarga, $request->user());

        return ApiResponse::success(null, 'Keluarga berhasil dihapus');
    }
}
