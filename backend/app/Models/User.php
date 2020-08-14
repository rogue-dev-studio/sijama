<?php

namespace App\Models;

use App\Support\DapukanTingkat;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'dapukan_id',
        'jamaah_id',
        'pusat_id',
        'daerah_id',
        'desa_id',
        'kelompok_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function dapukan(): BelongsTo
    {
        return $this->belongsTo(Dapukan::class);
    }

    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class);
    }

    public function pusat(): BelongsTo
    {
        return $this->belongsTo(Pusat::class);
    }

    public function daerah(): BelongsTo
    {
        return $this->belongsTo(Daerah::class);
    }

    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class);
    }

    public function kelompok(): BelongsTo
    {
        return $this->belongsTo(Kelompok::class);
    }

    /** @return Collection<int, Dapukan> */
    public function effectiveDapukan(): Collection
    {
        $this->loadMissing(['jamaah.dapukan', 'dapukan']);

        if ($this->jamaah && $this->jamaah->relationLoaded('dapukan') && $this->jamaah->dapukan->isNotEmpty()) {
            return $this->jamaah->dapukan;
        }

        return Collection::make($this->dapukan ? [$this->dapukan] : []);
    }

    public function primaryDapukan(): ?Dapukan
    {
        return DapukanTingkat::broadest($this->effectiveDapukan()) ?? $this->dapukan;
    }

    public function isSuperAdmin(): bool
    {
        return $this->effectiveDapukan()->contains(fn (Dapukan $dapukan) => $dapukan->kode === 'superadmin');
    }

    public function hasPermission(string $kode): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return in_array($kode, $this->permissionCodes(), true);
    }

    public function permissionCodes(): array
    {
        if ($this->isSuperAdmin()) {
            return HakAkses::query()->orderBy('kode')->pluck('kode')->all();
        }

        $dapukan = $this->effectiveDapukan();
        $dapukan->loadMissing('hakAkses');

        return $dapukan
            ->flatMap(fn (Dapukan $item) => $item->hakAkses->pluck('kode'))
            ->unique()
            ->sort()
            ->values()
            ->all();
    }
}
