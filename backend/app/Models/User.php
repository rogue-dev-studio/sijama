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

    protected $attributes = [
        'login_remember_minutes' => 1440,
        'login_remember_until_logout' => false,
    ];

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
        'login_remember_minutes',
        'login_remember_until_logout',
        'path_tanda_tangan',
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
            'login_remember_until_logout' => 'boolean',
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

        $items = collect();

        // Dapukan akun (users.dapukan_id) tetap dihitung — jangan diganti penuh oleh dapukan jamaah.
        if ($this->dapukan) {
            $items->push($this->dapukan);
        }

        if ($this->jamaah) {
            $this->jamaah->loadMissing('dapukan');
            if ($this->jamaah->dapukan->isNotEmpty()) {
                $items = $items->merge($this->jamaah->dapukan);
            }
        }

        return $items->unique('id')->values();
    }

    public function primaryDapukan(): ?Dapukan
    {
        return DapukanTingkat::broadest($this->effectiveDapukan()) ?? $this->dapukan;
    }

    public function isSuperAdmin(): bool
    {
        if ($this->dapukan?->slug === 'superadmin') {
            return true;
        }

        return $this->effectiveDapukan()->contains(fn (Dapukan $dapukan) => $dapukan->slug === 'superadmin');
    }

    public function hasPermission(string $slug): bool
    {
        return in_array($slug, $this->permissionCodes(), true);
    }

    public function permissionCodes(): array
    {
        $dapukan = new \Illuminate\Database\Eloquent\Collection($this->effectiveDapukan()->all());
        if ($dapukan->isEmpty()) {
            return [];
        }

        $dapukan->loadMissing('hakAkses');

        return $dapukan
            ->flatMap(fn (Dapukan $item) => $item->hakAkses->pluck('slug'))
            ->unique()
            ->sort()
            ->values()
            ->all();
    }
}
