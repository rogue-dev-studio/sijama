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
            'pusat' => $query->whereHas('kelompok.desa.daerah', fn (Builder $q) => $q->where('pusat_id', $user->pusat_id)),
            'daerah' => $query->whereHas('kelompok.desa', fn (Builder $q) => $q->where('daerah_id', $user->daerah_id)),
            'desa' => $query->whereHas('kelompok', fn (Builder $q) => $q->where('desa_id', $user->desa_id)),
            'kelompok' => $query->where('keluarga.kelompok_id', $user->kelompok_id),
            default => $query->whereKey([]),
        };
    }

    public function assertKeluargaInScope(User $user, Keluarga $keluarga): void
    {
        if ($this->isGlobal($user)) {
            return;
        }

        $keluarga->loadMissing('kelompok.desa.daerah');

        $inScope = match ($this->tingkat($user)) {
            'pusat' => $keluarga->kelompok?->desa?->daerah?->pusat_id === $user->pusat_id,
            'daerah' => $keluarga->kelompok?->desa?->daerah_id === $user->daerah_id,
            'desa' => $keluarga->kelompok?->desa_id === $user->desa_id,
            'kelompok' => $keluarga->kelompok_id === $user->kelompok_id,
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
            'pusat' => $query->whereHas('kelompok.desa.daerah', fn (Builder $q) => $q->where('pusat_id', $user->pusat_id)),
            'daerah' => $query->whereHas('kelompok.desa', fn (Builder $q) => $q->where('daerah_id', $user->daerah_id)),
            'desa' => $query->whereHas('kelompok', fn (Builder $q) => $q->where('desa_id', $user->desa_id)),
            'kelompok' => $query->where('jamaah.kelompok_id', $user->kelompok_id),
            default => $query->whereKey([]),
        };
    }

    public function assertJamaahInScope(User $user, Jamaah $jamaah): void
    {
        if ($this->isGlobal($user)) {
            return;
        }

        $jamaah->loadMissing('kelompok.desa.daerah');

        $inScope = match ($this->tingkat($user)) {
            'pusat' => $jamaah->kelompok?->desa?->daerah?->pusat_id === $user->pusat_id,
            'daerah' => $jamaah->kelompok?->desa?->daerah_id === $user->daerah_id,
            'desa' => $jamaah->kelompok?->desa_id === $user->desa_id,
            'kelompok' => $jamaah->kelompok_id === $user->kelompok_id,
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
            'pusat' => $query->whereHas('desa.daerah', fn (Builder $q) => $q->where('pusat_id', $user->pusat_id)),
            'daerah' => $query->whereHas('desa', fn (Builder $q) => $q->where('daerah_id', $user->daerah_id)),
            'desa' => $query->where('desa_id', $user->desa_id),
            'kelompok' => $query->where('id', $user->kelompok_id),
            default => $query->whereKey([]),
        };
    }

    public function applyDesaScope(Builder $query, User $user): Builder
    {
        if ($this->isGlobal($user)) {
            return $query;
        }

        return match ($this->tingkat($user)) {
            'pusat' => $query->whereHas('daerah', fn (Builder $q) => $q->where('pusat_id', $user->pusat_id)),
            'daerah' => $query->where('daerah_id', $user->daerah_id),
            'desa', 'kelompok' => $query->where('id', $user->desa_id),
            default => $query->whereKey([]),
        };
    }

    public function applyDaerahScope(Builder $query, User $user): Builder
    {
        if ($this->isGlobal($user)) {
            return $query;
        }

        return match ($this->tingkat($user)) {
            'pusat' => $query->where('pusat_id', $user->pusat_id),
            'daerah', 'desa', 'kelompok' => $query->where('id', $user->daerah_id),
            default => $query->whereKey([]),
        };
    }

    public function applyPusatScope(Builder $query, User $user): Builder
    {
        if ($this->isGlobal($user)) {
            return $query;
        }

        return match ($this->tingkat($user)) {
            'pusat' => $query->where('id', $user->pusat_id),
            default => $query->whereKey([]),
        };
    }

    public function assertKelompokInScope(User $user, Kelompok $kelompok): void
    {
        if ($this->isGlobal($user)) {
            return;
        }

        $kelompok->loadMissing('desa.daerah');

        $inScope = match ($this->tingkat($user)) {
            'pusat' => $kelompok->desa?->daerah?->pusat_id === $user->pusat_id,
            'daerah' => $kelompok->desa?->daerah_id === $user->daerah_id,
            'desa' => $kelompok->desa_id === $user->desa_id,
            'kelompok' => $kelompok->id === $user->kelompok_id,
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

        $desa->loadMissing('daerah');

        $inScope = match ($this->tingkat($user)) {
            'pusat' => $desa->daerah?->pusat_id === $user->pusat_id,
            'daerah' => $desa->daerah_id === $user->daerah_id,
            'desa', 'kelompok' => $desa->id === $user->desa_id,
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
            'pusat' => $daerah->pusat_id === $user->pusat_id,
            default => $daerah->id === $user->daerah_id,
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

        if ($this->tingkat($user) !== 'pusat' || $pusat->id !== $user->pusat_id) {
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
            if ($requestedKelompokId !== null && $requestedKelompokId !== $user->kelompok_id) {
                throw new AccessDeniedHttpException('Kelompok jamaah harus sesuai kelompok Anda.');
            }

            if (! $user->kelompok_id) {
                throw new AccessDeniedHttpException('Pengguna belum memiliki kelompok.');
            }

            return $user->kelompok_id;
        }

        if ($requestedKelompokId === null) {
            throw new AccessDeniedHttpException('Kelompok wajib dipilih.');
        }

        $kelompok = Kelompok::with('desa')->find($requestedKelompokId);

        if (! $kelompok) {
            throw new AccessDeniedHttpException('Kelompok tidak ditemukan.');
        }

        $this->assertKelompokInScope($user, $kelompok);

        return $requestedKelompokId;
    }
}
