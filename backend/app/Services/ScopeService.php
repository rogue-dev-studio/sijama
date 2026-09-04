<?php

namespace App\Services;

use App\Models\Daerah;
use App\Models\Desa;
use App\Models\Jamaah;
use App\Models\Keluarga;
use App\Models\Kelompok;
use App\Models\Pusat;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ScopeService
{
    public function tingkat(User $user): ?string
    {
        return $user->primaryDapukan()?->tingkat;
    }

    public function isGlobal(User $user): bool
    {
        return $this->tingkat($user) === 'global' || $user->isSuperAdmin();
    }

    public function applyKeluargaScope(Builder $query, User $user): Builder
    {
        if ($this->isGlobal($user)) {
            return $query;
        }

        return match ($this->tingkat($user)) {
            'pusat' => $query->whereHas('wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah', fn (Builder $q) => $q->where('wilayah_fung_pusat_id', $user->wilayah_fung_pusat_id)),
            'daerah' => $query->whereHas('wilayahFungKelompok.wilayahFungDesa', fn (Builder $q) => $q->where('wilayah_fung_daerah_id', $user->wilayah_fung_daerah_id)),
            'desa' => $query->whereHas('wilayahFungKelompok', fn (Builder $q) => $q->where('wilayah_fung_desa_id', $user->wilayah_fung_desa_id)),
            'kelompok' => $query->where('keluarga.wilayah_fung_kelompok_id', $user->wilayah_fung_kelompok_id),
            default => $query->whereKey([]),
        };
    }

    public function assertKeluargaInScope(User $user, Keluarga $keluarga): void
    {
        if ($this->isGlobal($user)) {
            return;
        }

        $keluarga->loadMissing('wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah');

        $inScope = match ($this->tingkat($user)) {
            'pusat' => $keluarga->wilayahFungKelompok?->wilayahFungDesa?->wilayahFungDaerah?->wilayah_fung_pusat_id === $user->wilayah_fung_pusat_id,
            'daerah' => $keluarga->wilayahFungKelompok?->wilayahFungDesa?->wilayah_fung_daerah_id === $user->wilayah_fung_daerah_id,
            'desa' => $keluarga->wilayahFungKelompok?->wilayah_fung_desa_id === $user->wilayah_fung_desa_id,
            'kelompok' => $keluarga->wilayah_fung_kelompok_id === $user->wilayah_fung_kelompok_id,
            default => false,
        };

        if (! $inScope) {
            throw new AccessDeniedHttpException('Keluarga di luar cakupan akses Anda.');
        }
    }

    public function applyJamaahScope(Builder $query, User $user): Builder
    {
        if ($this->isGlobal($user)) {
            return $query;
        }

        return match ($this->tingkat($user)) {
            'pusat' => $query->whereHas('wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah', fn (Builder $q) => $q->where('wilayah_fung_pusat_id', $user->wilayah_fung_pusat_id)),
            'daerah' => $query->whereHas('wilayahFungKelompok.wilayahFungDesa', fn (Builder $q) => $q->where('wilayah_fung_daerah_id', $user->wilayah_fung_daerah_id)),
            'desa' => $query->whereHas('wilayahFungKelompok', fn (Builder $q) => $q->where('wilayah_fung_desa_id', $user->wilayah_fung_desa_id)),
            'kelompok' => $query->where($query->getModel()->getTable().'.wilayah_fung_kelompok_id', $user->wilayah_fung_kelompok_id),
            default => $query->whereKey([]),
        };
    }

    public function assertJamaahInScope(User $user, Jamaah $jamaah): void
    {
        if ($this->isGlobal($user)) {
            return;
        }

        $jamaah->loadMissing('wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah');

        $inScope = match ($this->tingkat($user)) {
            'pusat' => $jamaah->wilayahFungKelompok?->wilayahFungDesa?->wilayahFungDaerah?->wilayah_fung_pusat_id === $user->wilayah_fung_pusat_id,
            'daerah' => $jamaah->wilayahFungKelompok?->wilayahFungDesa?->wilayah_fung_daerah_id === $user->wilayah_fung_daerah_id,
            'desa' => $jamaah->wilayahFungKelompok?->wilayah_fung_desa_id === $user->wilayah_fung_desa_id,
            'kelompok' => $jamaah->wilayah_fung_kelompok_id === $user->wilayah_fung_kelompok_id,
            default => false,
        };

        if (! $inScope) {
            throw new AccessDeniedHttpException('Jamaah di luar cakupan akses Anda.');
        }
    }

    public function applyKelompokScope(Builder $query, User $user): Builder
    {
        if ($this->isGlobal($user)) {
            return $query;
        }

        return match ($this->tingkat($user)) {
            'pusat' => $query->whereHas('wilayahFungDesa.wilayahFungDaerah', fn (Builder $q) => $q->where('wilayah_fung_pusat_id', $user->wilayah_fung_pusat_id)),
            'daerah' => $query->whereHas('wilayahFungDesa', fn (Builder $q) => $q->where('wilayah_fung_daerah_id', $user->wilayah_fung_daerah_id)),
            'desa' => $query->where('wilayah_fung_desa_id', $user->wilayah_fung_desa_id),
            'kelompok' => $query->where('id', $user->wilayah_fung_kelompok_id),
            default => $query->whereKey([]),
        };
    }

    public function applyDesaScope(Builder $query, User $user): Builder
    {
        if ($this->isGlobal($user)) {
            return $query;
        }

        return match ($this->tingkat($user)) {
            'pusat' => $query->whereHas('wilayahFungDaerah', fn (Builder $q) => $q->where('wilayah_fung_pusat_id', $user->wilayah_fung_pusat_id)),
            'daerah' => $query->where('wilayah_fung_daerah_id', $user->wilayah_fung_daerah_id),
            'desa', 'kelompok' => $query->where('id', $user->wilayah_fung_desa_id),
            default => $query->whereKey([]),
        };
    }

    public function applyDaerahScope(Builder $query, User $user): Builder
    {
        if ($this->isGlobal($user)) {
            return $query;
        }

        return match ($this->tingkat($user)) {
            'pusat' => $query->where('wilayah_fung_pusat_id', $user->wilayah_fung_pusat_id),
            'daerah', 'desa', 'kelompok' => $query->where('id', $user->wilayah_fung_daerah_id),
            default => $query->whereKey([]),
        };
    }

    public function applyPusatScope(Builder $query, User $user): Builder
    {
        if ($this->isGlobal($user)) {
            return $query;
        }

        return match ($this->tingkat($user)) {
            'pusat' => $query->where('id', $user->wilayah_fung_pusat_id),
            default => $query->whereKey([]),
        };
    }

    public function assertKelompokInScope(User $user, Kelompok $kelompok): void
    {
        if ($this->isGlobal($user)) {
            return;
        }

        $kelompok->loadMissing('wilayahFungDesa.wilayahFungDaerah');

        $inScope = match ($this->tingkat($user)) {
            'pusat' => $kelompok->wilayahFungDesa?->wilayahFungDaerah?->wilayah_fung_pusat_id === $user->wilayah_fung_pusat_id,
            'daerah' => $kelompok->wilayahFungDesa?->wilayah_fung_daerah_id === $user->wilayah_fung_daerah_id,
            'desa' => $kelompok->wilayah_fung_desa_id === $user->wilayah_fung_desa_id,
            'kelompok' => $kelompok->id === $user->wilayah_fung_kelompok_id,
            default => false,
        };

        if (! $inScope) {
            throw new AccessDeniedHttpException('Kelompok di luar cakupan akses Anda.');
        }
    }

    public function assertDesaInScope(User $user, Desa $desa): void
    {
        if ($this->isGlobal($user)) {
            return;
        }

        $desa->loadMissing('wilayahFungDaerah');

        $inScope = match ($this->tingkat($user)) {
            'pusat' => $desa->wilayahFungDaerah?->wilayah_fung_pusat_id === $user->wilayah_fung_pusat_id,
            'daerah' => $desa->wilayah_fung_daerah_id === $user->wilayah_fung_daerah_id,
            'desa', 'kelompok' => $desa->id === $user->wilayah_fung_desa_id,
            default => false,
        };

        if (! $inScope) {
            throw new AccessDeniedHttpException('Desa di luar cakupan akses Anda.');
        }
    }

    public function assertDaerahInScope(User $user, Daerah $daerah): void
    {
        if ($this->isGlobal($user)) {
            return;
        }

        $inScope = match ($this->tingkat($user)) {
            'pusat' => $daerah->wilayah_fung_pusat_id === $user->wilayah_fung_pusat_id,
            default => $daerah->id === $user->wilayah_fung_daerah_id,
        };

        if (! $inScope) {
            throw new AccessDeniedHttpException('Daerah di luar cakupan akses Anda.');
        }
    }

    public function assertPusatInScope(User $user, Pusat $pusat): void
    {
        if ($this->isGlobal($user)) {
            return;
        }

        if ($this->tingkat($user) !== 'pusat' || $pusat->id !== $user->wilayah_fung_pusat_id) {
            throw new AccessDeniedHttpException('Pusat di luar cakupan akses Anda.');
        }
    }

    public function resolvesKelompokFromUser(User $user): bool
    {
        return $this->tingkat($user) === 'kelompok';
    }

    public function resolveKelompokIdForCreate(User $user, ?int $requestedKelompokId): int
    {
        if ($this->resolvesKelompokFromUser($user)) {
            if ($requestedKelompokId !== null && $requestedKelompokId !== $user->wilayah_fung_kelompok_id) {
                throw new AccessDeniedHttpException('Kelompok jamaah harus sesuai kelompok Anda.');
            }

            if (! $user->wilayah_fung_kelompok_id) {
                throw new AccessDeniedHttpException('Pengguna belum memiliki kelompok.');
            }

            return $user->wilayah_fung_kelompok_id;
        }

        if ($requestedKelompokId === null) {
            throw new AccessDeniedHttpException('Kelompok wajib dipilih.');
        }

        $kelompok = Kelompok::with('wilayahFungDesa')->find($requestedKelompokId);

        if (! $kelompok) {
            throw new AccessDeniedHttpException('Kelompok tidak ditemukan.');
        }

        $this->assertKelompokInScope($user, $kelompok);

        return $requestedKelompokId;
    }
}
