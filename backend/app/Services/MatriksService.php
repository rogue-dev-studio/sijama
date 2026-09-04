<?php

namespace App\Services;

use App\Http\Resources\DapukanResource;
use App\Http\Resources\HakAksesResource;
use App\Models\Dapukan;
use App\Models\HakAkses;
use App\Models\User;
use App\Support\DapukanAccessGuard;
use App\Support\SuperAdminAccess;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class MatriksService
{
    public function __construct(
        private readonly AuditActivityService $auditActivityService,
    ) {}

    public function show(User $actor): array
    {
        $dapukanQuery = Dapukan::query()->orderBy('urutan')->with('hakAkses');
        DapukanAccessGuard::applyManageableDapukanFilter($dapukanQuery, $actor);
        $dapukan = $dapukanQuery->get();

        $hakAksesQuery = HakAkses::query()
            ->with(['fitur.menu.parent.parent'])
            ->orderBy('slug');
        DapukanAccessGuard::applyVisibleHakAksesFilter($hakAksesQuery, $actor);
        $hakAkses = $hakAksesQuery->get();

        return [
            'dapukan' => DapukanResource::collection($dapukan)->resolve(),
            'hak_akses' => HakAksesResource::collection($hakAkses)->resolve(),
        ];
    }

    public function update(User $actor, int $dapukanId, array $hakAksesIds): DapukanResource
    {
        $dapukan = Dapukan::with('hakAkses')->find($dapukanId);

        if (! $dapukan) {
            throw new ModelNotFoundException('Dapukan tidak ditemukan.');
        }

        DapukanAccessGuard::assertCanManageDapukan($actor, $dapukan);

        if (SuperAdminAccess::isSuperadminDapukan($dapukan)) {
            SuperAdminAccess::grantAll();
            $this->auditActivityService->record([
                'module' => AuditActivityService::MODULE_ACCESS,
                'action' => 'matriks_sync',
                'entity_type' => 'dapukan',
                'entity_id' => $dapukan->id,
                'entity_label' => $dapukan->nama,
                'summary' => 'Sinkron matriks Super Admin (grant all)',
                'meta' => ['mode' => 'superadmin_grant_all'],
                'actor' => $actor,
            ]);

            return new DapukanResource($dapukan->fresh()->load('hakAkses'));
        }

        $beforeIds = $dapukan->hakAkses->pluck('id')->map(fn ($id) => (int) $id)->sort()->values()->all();

        $validIds = HakAkses::query()->whereIn('id', $hakAksesIds)->pluck('id')->all();

        if (count($validIds) !== count(array_unique($hakAksesIds))) {
            throw ValidationException::withMessages([
                'hak_akses_ids' => ['Terdapat hak akses yang tidak valid.'],
            ]);
        }

        $assignableIds = DapukanAccessGuard::filterAssignableHakAksesIds($actor, $validIds);

        if (! $actor->isSuperAdmin() && count($assignableIds) !== count($validIds)) {
            throw ValidationException::withMessages([
                'hak_akses_ids' => ['Terdapat hak akses yang hanya dapat dikelola Super Admin.'],
            ]);
        }

        $afterIds = array_values(array_unique(array_map('intval', $assignableIds)));
        sort($afterIds);
        $dapukan->hakAkses()->sync($afterIds);

        $added = array_values(array_diff($afterIds, $beforeIds));
        $removed = array_values(array_diff($beforeIds, $afterIds));

        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_ACCESS,
            'action' => 'matriks_sync',
            'entity_type' => 'dapukan',
            'entity_id' => $dapukan->id,
            'entity_label' => $dapukan->nama,
            'summary' => sprintf(
                'Ubah matriks akses dapukan %s (+%d / -%d)',
                $dapukan->nama,
                count($added),
                count($removed),
            ),
            'meta' => [
                'before_count' => count($beforeIds),
                'after_count' => count($afterIds),
                'added_ids' => $added,
                'removed_ids' => $removed,
            ],
            'actor' => $actor,
        ]);

        return new DapukanResource($dapukan->fresh()->load('hakAkses'));
    }
}
