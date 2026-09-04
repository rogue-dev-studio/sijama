<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Models\Dapukan;
use App\Models\Jamaah;
use App\Models\User;
use App\Support\DemoUserGuard;
use App\Support\DapukanAccessGuard;
use App\Support\LoginRememberOptions;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use App\Support\SuperAdminAccess;
use App\Support\UserProfileFromJamaah;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MasterUserService
{
    public function __construct(
        private readonly AuditActivityService $auditActivityService,
    ) {}

    public function list(
        ?string $query = null,
        ?bool $isActive = null,
        ?int $dapukanId = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
        ?User $actor = null,
    ): LengthAwarePaginator {
        $builder = User::query()
            ->with(['dapukan', 'jamaah.dapukan', 'wilayahFungPusat', 'wilayahFungDaerah', 'wilayahFungDesa', 'wilayahFungKelompok']);

        if ($actor instanceof User) {
            DapukanAccessGuard::applyManageableUserFilter($builder, $actor);
        }

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['name', 'username', 'is_active'],
            'name',
        );

        if ($query) {
            $builder->where(function ($q) use ($query) {
                $q->where('name', 'ilike', "%{$query}%")
                    ->orWhere('username', 'ilike', "%{$query}%")
                    ->orWhere('email', 'ilike', "%{$query}%");
            });
        }

        if ($isActive !== null) {
            $builder->where('is_active', $isActive);
        }

        if ($dapukanId !== null) {
            $builder->where(function ($q) use ($dapukanId) {
                $q->where('dapukan_id', $dapukanId)
                    ->orWhereHas('jamaah.dapukan', fn ($d) => $d->whereKey($dapukanId));
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function create(array $data, User $actor): UserResource
    {
        $synced = $this->attributesFromJamaah($data);
        $this->assertCreatableUser($synced['dapukan_id'] ?? null, $actor);

        $user = User::createManaged([
            'name' => $synced['name'],
            'username' => $data['username'],
            'email' => $synced['email'],
            'password' => Hash::make($data['password']),
            'dapukan_id' => $synced['dapukan_id'],
            'jamaah_id' => $synced['jamaah_id'],
            'wilayah_fung_pusat_id' => $synced['wilayah_fung_pusat_id'],
            'wilayah_fung_daerah_id' => $synced['wilayah_fung_daerah_id'],
            'wilayah_fung_desa_id' => $synced['wilayah_fung_desa_id'],
            'wilayah_fung_kelompok_id' => $synced['wilayah_fung_kelompok_id'],
            'is_active' => $data['is_active'] ?? true,
            'login_remember_minutes' => LoginRememberOptions::DEFAULT_MINUTES,
            'login_remember_until_logout' => false,
        ]);

        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_ACCESS,
            'action' => 'user_create',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'entity_label' => $user->username,
            'summary' => sprintf('Buat pengguna %s', $user->username),
            'meta' => [
                'jamaah_id' => $user->jamaah_id,
                'dapukan_id' => $user->dapukan_id,
                'is_active' => (bool) $user->is_active,
            ],
            'actor' => $actor,
        ]);

        return new UserResource($user->load(['dapukan', 'jamaah.dapukan', 'wilayahFungPusat', 'wilayahFungDaerah', 'wilayahFungDesa', 'wilayahFungKelompok']));
    }

    public function find(int $id, User $actor): UserResource
    {
        $user = $this->findModel($id);
        DapukanAccessGuard::assertCanManageUser($actor, $user);

        return new UserResource($user->load(['dapukan', 'jamaah.dapukan', 'wilayahFungPusat', 'wilayahFungDaerah', 'wilayahFungDesa', 'wilayahFungKelompok']));
    }

    public function update(int $id, array $data, User $actor): UserResource
    {
        $user = $this->findModel($id);
        DapukanAccessGuard::assertCanManageUser($actor, $user);
        DemoUserGuard::assertCanUpdate($user);

        $before = [
            'username' => $user->username,
            'is_active' => (bool) $user->is_active,
            'jamaah_id' => $user->jamaah_id,
            'dapukan_id' => $user->dapukan_id,
        ];
        $passwordChanged = ! empty($data['password']);

        $attributes = [
            'username' => $data['username'] ?? $user->username,
            'is_active' => $data['is_active'] ?? $user->is_active,
        ];

        if ($passwordChanged) {
            $attributes['password'] = Hash::make($data['password']);
        }

        $wantsJamaah = array_key_exists('jamaah_id', $data) ? $data['jamaah_id'] : $user->jamaah_id;

        if ($wantsJamaah) {
            $synced = $this->attributesFromJamaah(['jamaah_id' => $wantsJamaah]);
            $this->assertCreatableUser($synced['dapukan_id'] ?? null, $actor);
            $attributes = array_merge($attributes, $synced);
        } elseif (array_key_exists('jamaah_id', $data) && $data['jamaah_id'] === null) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Pengguna wajib terhubung ke data jamaah.'],
            ]);
        }

        $user->updateAttributes($attributes);
        $fresh = $user->fresh();

        $after = [
            'username' => $fresh->username,
            'is_active' => (bool) $fresh->is_active,
            'jamaah_id' => $fresh->jamaah_id,
            'dapukan_id' => $fresh->dapukan_id,
        ];
        $diff = $this->auditActivityService->diff($before, $after);
        if ($passwordChanged) {
            $diff['changed'][] = 'password';
            $diff['after']['password_changed'] = true;
        }

        if ($diff['changed'] !== [] || $passwordChanged) {
            $this->auditActivityService->record([
                'module' => AuditActivityService::MODULE_ACCESS,
                'action' => $passwordChanged ? 'user_update_password' : 'user_update',
                'entity_type' => 'user',
                'entity_id' => $fresh->id,
                'entity_label' => $fresh->username,
                'summary' => $passwordChanged
                    ? sprintf('Ubah pengguna %s (termasuk password)', $fresh->username)
                    : sprintf('Ubah pengguna %s', $fresh->username),
                'meta' => $diff,
                'actor' => $actor,
            ]);
        }

        return new UserResource($fresh->load(['dapukan', 'jamaah.dapukan', 'wilayahFungPusat', 'wilayahFungDaerah', 'wilayahFungDesa', 'wilayahFungKelompok']));
    }

    public function deactivate(int $id, User $actor): UserResource
    {
        $user = $this->findModel($id);
        DapukanAccessGuard::assertCanManageUser($actor, $user);
        SuperAdminAccess::assertCanDeactivate($user);
        DemoUserGuard::assertCanDeactivate($user);
        $user->updateAttributes(['is_active' => false]);

        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_ACCESS,
            'action' => 'user_deactivate',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'entity_label' => $user->username,
            'summary' => sprintf('Nonaktifkan pengguna %s', $user->username),
            'meta' => ['is_active' => ['before' => true, 'after' => false]],
            'actor' => $actor,
        ]);

        return new UserResource($user->fresh()->load(['dapukan', 'jamaah.dapukan', 'wilayahFungPusat', 'wilayahFungDaerah', 'wilayahFungDesa', 'wilayahFungKelompok']));
    }

    public function syncFromJamaahModel(Jamaah $jamaah): void
    {
        $jamaah->loadMissing(['dapukan', 'wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah', 'user']);

        if (! $jamaah->user || $jamaah->dapukan->isEmpty()) {
            return;
        }

        if ($jamaah->user->isSuperAdmin()) {
            return;
        }

        $jamaah->user->updateAttributes(UserProfileFromJamaah::resolve($jamaah));
    }

    private function findModel(int $id): User
    {
        $user = User::find($id);

        if (! $user) {
            throw new ModelNotFoundException('Pengguna tidak ditemukan.');
        }

        return $user;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{
     *   jamaah_id: int,
     *   name: string,
     *   email: ?string,
     *   dapukan_id: int,
     *   wilayah_fung_pusat_id: ?int,
     *   wilayah_fung_daerah_id: ?int,
     *   wilayah_fung_desa_id: ?int,
     *   wilayah_fung_kelompok_id: ?int
     * }
     */
    private function attributesFromJamaah(array $data): array
    {
        $jamaahId = $data['jamaah_id'] ?? null;
        if (! $jamaahId) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Pengguna wajib terhubung ke data jamaah.'],
            ]);
        }

        $jamaah = Jamaah::query()
            ->with(['dapukan', 'wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah'])
            ->find($jamaahId);

        if (! $jamaah) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Jamaah tidak ditemukan.'],
            ]);
        }

        return [
            'jamaah_id' => $jamaah->id,
            ...UserProfileFromJamaah::resolve($jamaah),
        ];
    }

    private function assertCreatableUser(?int $dapukanId, User $actor): void
    {
        if ($dapukanId === null) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Pengguna wajib terhubung ke data jamaah.'],
            ]);
        }

        $dapukan = Dapukan::query()->find($dapukanId);

        if (! $dapukan) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Dapukan jamaah tidak valid.'],
            ]);
        }

        DapukanAccessGuard::assertCanManageDapukan($actor, $dapukan);
    }
}
