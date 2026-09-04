<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 17:35:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 17:35:00
 */

namespace App\Support;

use App\Models\Dapukan;
use App\Models\HakAkses;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

final class DapukanAccessGuard
{
    /** @var list<string> */
    public const SUPERADMIN_ONLY_PREFIXES = [
        'konfig.',
        'konfig_dokumen.',
        'matriks.',
        'menu.',
        'fitur.',
        'hak_akses.',
    ];

    public static function isSuperadminOnlyPermissionSlug(string $slug): bool
    {
        foreach (self::SUPERADMIN_ONLY_PREFIXES as $prefix) {
            if (str_starts_with($slug, $prefix)) {
                return true;
            }
        }

        return in_array($slug, ['dapukan.create', 'dapukan.update', 'dapukan.delete'], true);
    }

    public static function canManageDapukan(User $actor, Dapukan $target): bool
    {
        if ($target->slug === 'superadmin') {
            return $actor->isSuperAdmin();
        }

        if ($actor->isSuperAdmin()) {
            return true;
        }

        return DapukanTingkat::isAssignableBy(
            $target->tingkat,
            $actor->primaryDapukan()?->tingkat
        );
    }

    public static function assertCanManageDapukan(User $actor, Dapukan $target): void
    {
        if (self::canManageDapukan($actor, $target)) {
            return;
        }

        throw ValidationException::withMessages([
            'dapukan' => ['Anda tidak dapat mengubah dapukan di atas level Anda.'],
        ]);
    }

    public static function assertCanManageUser(User $actor, User $target): void
    {
        if ($target->isSuperAdmin() && ! $actor->isSuperAdmin()) {
            throw ValidationException::withMessages([
                'username' => ['Hanya Super Admin yang dapat mengubah akun Super Admin.'],
            ]);
        }

        if ($actor->isSuperAdmin()) {
            return;
        }

        $targetDapukan = $target->primaryDapukan();
        $actorDapukan = $actor->primaryDapukan();

        if ($targetDapukan === null || $actorDapukan === null) {
            throw ValidationException::withMessages([
                'username' => ['Anda tidak dapat mengubah pengguna ini.'],
            ]);
        }

        if (! DapukanTingkat::isAssignableBy($targetDapukan->tingkat, $actorDapukan->tingkat)) {
            throw ValidationException::withMessages([
                'username' => ['Anda tidak dapat mengubah pengguna dengan dapukan di atas level Anda.'],
            ]);
        }
    }

    /** @param Builder<Dapukan> $builder */
    public static function applyManageableDapukanFilter(Builder $builder, User $actor): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        $allowed = DapukanTingkat::tingkatAtOrBelow($actor->primaryDapukan()?->tingkat);

        if ($allowed === []) {
            $builder->whereKey([]);

            return;
        }

        $builder
            ->whereIn('tingkat', $allowed)
            ->where('slug', '!=', 'superadmin');
    }

    /** @param Builder<User> $builder */
    public static function applyManageableUserFilter(Builder $builder, User $actor): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        $allowed = DapukanTingkat::tingkatAtOrBelow($actor->primaryDapukan()?->tingkat);

        if ($allowed === []) {
            $builder->whereKey([]);

            return;
        }

        $builder->where(function ($query) use ($allowed) {
            $query
                ->whereHas('dapukan', function ($dapukan) use ($allowed) {
                    $dapukan
                        ->whereIn('tingkat', $allowed)
                        ->where('slug', '!=', 'superadmin');
                })
                ->whereDoesntHave('dapukan', fn ($dapukan) => $dapukan->where('slug', 'superadmin'));
        });
    }

    /** @param list<int> $hakAksesIds @return list<int> */
    public static function filterAssignableHakAksesIds(User $actor, array $hakAksesIds): array
    {
        if ($actor->isSuperAdmin()) {
            return array_values(array_unique($hakAksesIds));
        }

        if ($hakAksesIds === []) {
            return [];
        }

        return HakAkses::query()
            ->whereIn('id', $hakAksesIds)
            ->get(['id', 'slug'])
            ->filter(fn (HakAkses $item) => ! self::isSuperadminOnlyPermissionSlug($item->slug))
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }

    /** @param Builder<HakAkses> $builder */
    public static function applyVisibleHakAksesFilter(Builder $builder, User $actor): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        foreach (self::SUPERADMIN_ONLY_PREFIXES as $prefix) {
            $builder->where('slug', 'not like', $prefix.'%');
        }

        $builder->whereNotIn('slug', ['dapukan.create', 'dapukan.update', 'dapukan.delete']);
    }
}
