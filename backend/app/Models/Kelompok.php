<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kelompok extends Model
{
    protected $table = 'wilayah_fung_kelompok_m';

    protected $fillable = [
        'wilayah_fung_desa_id',
        'kode',
        'nama',
        'singkatan',
        'deskripsi',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function wilayahFungDesa(): BelongsTo
    {
        return $this->belongsTo(Desa::class, 'wilayah_fung_desa_id');
    }

    public function jamaah(): HasMany
    {
        return $this->hasMany(Jamaah::class, 'wilayah_fung_kelompok_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'wilayah_fung_kelompok_id');
    }

    public function subKelompok(): HasMany
    {
        return $this->hasMany(SubKelompok::class, 'wilayah_fung_kelompok_id');
    }
}
