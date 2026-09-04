<?php

namespace App\Models;

use App\Support\DemoUserGuard;
use App\Support\DapukanTingkat;
use App\Support\SuperAdminAccess;
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
        'login_remember_minutes',
        'login_remember_until_logout',
        'path_tanda_tangan',
    ];

    /**
     * @var list<string>
     */
    private const SCOPE_ATTRIBUTES = [
        'dapukan_id',
        'jamaah_id',
        'wilayah_fung_pusat_id',
        'wilayah_fung_daerah_id',
        'wilayah_fung_desa_id',
        'wilayah_fung_kelompok_id',
        'is_active',
        'is_demo',
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
            'is_demo' => 'boolean',
            'login_remember_until_logout' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::deleting(function (User $user): void {
            SuperAdminAccess::assertCanDelete($user);
            DemoUserGuard::assertCanDelete($user);
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function assignScopeAttributes(array $attributes): self
    {
        foreach (self::SCOPE_ATTRIBUTES as $key) {
            if (array_key_exists($key, $attributes)) {
                $this->setAttribute($key, $attributes[$key]);
            }
        }

        return $this;
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public static function createManaged(array $attributes): self
    {
        $scope = array_intersect_key($attributes, array_flip(self::SCOPE_ATTRIBUTES));
        $base = array_diff_key($attributes, array_flip(self::SCOPE_ATTRIBUTES));

        $user = static::query()->create($base);
        if ($scope !== []) {
            $user->assignScopeAttributes($scope)->save();
        }

        return $user->refresh();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function updateAttributes(array $attributes): bool
    {
        if (DemoUserGuard::isReservedUsername((string) $this->username)) {
            $attributes['is_demo'] = true;
        }

        $scope = array_intersect_key($attributes, array_flip(self::SCOPE_ATTRIBUTES));
        $base = array_diff_key($attributes, array_flip(self::SCOPE_ATTRIBUTES));

        if ($base !== []) {
            $this->fill($base);
        }
        if ($scope !== []) {
            $this->assignScopeAttributes($scope);
        }

        return $this->save();
    }

    public function isDemo(): bool
    {
        return (bool) $this->is_demo;
    }

    public function dapukan(): BelongsTo
    {
        return $this->belongsTo(Dapukan::class);
    }

    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class);
    }

    public function wilayahFungPusat(): BelongsTo
    {
        return $this->belongsTo(Pusat::class, 'wilayah_fung_pusat_id');
    }

    public function wilayahFungDaerah(): BelongsTo
    {
        return $this->belongsTo(Daerah::class, 'wilayah_fung_daerah_id');
    }

    public function wilayahFungDesa(): BelongsTo
    {
        return $this->belongsTo(Desa::class, 'wilayah_fung_desa_id');
    }

    public function wilayahFungKelompok(): BelongsTo
    {
        return $this->belongsTo(Kelompok::class, 'wilayah_fung_kelompok_id');
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

    /** @var list<string>|null */
    private ?array $permissionCodesCache = null;

    public function hasPermission(string $slug): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return in_array($slug, $this->permissionCodes(), true);
    }

    public function permissionCodes(): array
    {
        if ($this->permissionCodesCache !== null) {
            return $this->permissionCodesCache;
        }

        if ($this->isSuperAdmin()) {
            return $this->permissionCodesCache = HakAkses::query()->orderBy('slug')->pluck('slug')->all();
        }

        $dapukan = new \Illuminate\Database\Eloquent\Collection($this->effectiveDapukan()->all());
        if ($dapukan->isEmpty()) {
            return $this->permissionCodesCache = [];
        }

        $dapukan->loadMissing('hakAkses');

        return $this->permissionCodesCache = $dapukan
            ->flatMap(fn (Dapukan $item) => $item->hakAkses->pluck('slug'))
            ->unique()
            ->sort()
            ->values()
            ->all();
    }
}
