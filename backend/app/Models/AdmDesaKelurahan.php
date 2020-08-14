<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:28:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:28:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmDesaKelurahan extends Model
{
    protected $table = 'adm_desa_kelurahan';

    protected $fillable = [
        'kecamatan_id',
        'kode',
        'nama',
        'jenis',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function kecamatan(): BelongsTo
    {
        return $this->belongsTo(AdmKecamatan::class, 'kecamatan_id');
    }

    public function kodePos(): HasMany
    {
        return $this->hasMany(AdmKodePos::class, 'desa_kelurahan_id');
    }

    public function desa(): HasMany
    {
        return $this->hasMany(Desa::class, 'adm_desa_kelurahan_id');
    }

    public function jamaah(): HasMany
    {
        return $this->hasMany(Jamaah::class, 'adm_desa_kelurahan_id');
    }

    public function lokasi(): HasMany
    {
        return $this->hasMany(Lokasi::class, 'adm_desa_kelurahan_id');
    }
}
