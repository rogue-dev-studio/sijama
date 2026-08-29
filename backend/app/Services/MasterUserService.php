<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Models\Jamaah;
use App\Models\User;
use App\Support\LoginRememberOptions;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use App\Support\UserProfileFromJamaah;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MasterUserService
{
    public function list(
        ?string $query = null,
        ?bool $isActive = null,
        ?int $dapukanId = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = User::query()
            ->with(['dapukan', 'jamaah.dapukan', 'pusat', 'daerah', 'desa', 'kelompok']);

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

    public function create(array $data): UserResource
    {
        $synced = $this->attributesFromJamaah($data);

        $user = User::create([
            'name' => $synced['name'],
            'username' => $data['username'],
            'email' => $synced['email'],
            'password' => Hash::make($data['password']),
            'dapukan_id' => $synced['dapukan_id'],
            'jamaah_id' => $synced['jamaah_id'],
            'pusat_id' => $synced['pusat_id'],
            'daerah_id' => $synced['daerah_id'],
            'desa_id' => $synced['desa_id'],
            'kelompok_id' => $synced['kelompok_id'],
            'is_active' => $data['is_active'] ?? true,
            'login_remember_minutes' => LoginRememberOptions::DEFAULT_MINUTES,
            'login_remember_until_logout' => false,
        ]);

        return new UserResource($user->load(['dapukan', 'jamaah.dapukan', 'pusat', 'daerah', 'desa', 'kelompok']));
    }

    public function find(int $id): UserResource
    {
        return new UserResource($this->findModel($id)->load(['dapukan', 'jamaah.dapukan', 'pusat', 'daerah', 'desa', 'kelompok']));
    }

    public function update(int $id, array $data, User $actor): UserResource
    {
        $user = $this->findModel($id);
        $this->guardSuperadminMutation($user, $data, $actor);

        $attributes = [
            'username' => $data['username'] ?? $user->username,
            'is_active' => $data['is_active'] ?? $user->is_active,
        ];

        if (! empty($data['password'])) {
            $attributes['password'] = Hash::make($data['password']);
        }

        $wantsJamaah = array_key_exists('jamaah_id', $data) ? $data['jamaah_id'] : $user->jamaah_id;

        if ($wantsJamaah) {
            $synced = $this->attributesFromJamaah(['jamaah_id' => $wantsJamaah]);
            $attributes = array_merge($attributes, $synced);
        } elseif (array_key_exists('jamaah_id', $data) && $data['jamaah_id'] === null) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Pengguna wajib ditautkan ke master jamaah.'],
            ]);
        }

        $user->update($attributes);

        return new UserResource($user->fresh()->load(['dapukan', 'jamaah.dapukan', 'pusat', 'daerah', 'desa', 'kelompok']));
    }

    public function deactivate(int $id, User $actor): UserResource
    {
        $user = $this->findModel($id);
        $this->guardSuperadminMutation($user, ['is_active' => false], $actor);
        $user->update(['is_active' => false]);

        return new UserResource($user->fresh()->load(['dapukan', 'jamaah.dapukan', 'pusat', 'daerah', 'desa', 'kelompok']));
    }

    public function syncFromJamaahModel(Jamaah $jamaah): void
    {
        $jamaah->loadMissing(['dapukan', 'kelompok.desa.daerah', 'user']);

        if (! $jamaah->user || $jamaah->dapukan->isEmpty()) {
            return;
        }

        $jamaah->user->update(UserProfileFromJamaah::resolve($jamaah));
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
     *   pusat_id: ?int,
     *   daerah_id: ?int,
     *   desa_id: ?int,
     *   kelompok_id: ?int
     * }
     */
    private function attributesFromJamaah(array $data): array
    {
        $jamaahId = $data['jamaah_id'] ?? null;
        if (! $jamaahId) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Pengguna wajib ditautkan ke master jamaah.'],
            ]);
        }

        $jamaah = Jamaah::query()
            ->with(['dapukan', 'kelompok.desa.daerah'])
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

    private function guardSuperadminMutation(User $target, array $data, User $actor): void
    {
        if (! $target->isSuperAdmin()) {
            return;
        }

        if ($actor->isSuperAdmin()) {
            return;
        }

        if (array_key_exists('jamaah_id', $data) && (int) $data['jamaah_id'] !== (int) $target->jamaah_id) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Hanya superadmin yang dapat mengubah tautan jamaah superadmin.'],
            ]);
        }

        if (array_key_exists('is_active', $data) && $data['is_active'] === false) {
            throw ValidationException::withMessages([
                'is_active' => ['Pengguna superadmin tidak dapat dinonaktifkan.'],
            ]);
        }
    }
}
