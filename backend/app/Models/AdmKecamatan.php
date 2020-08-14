<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:30:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:30:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmKecamatan extends Model
{
    protected $table = 'adm_kecamatan';

    protected $fillable = [
        'kabupaten_kota_id',
        'kode',
        'nama',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function kabupatenKota(): BelongsTo
    {
        return $this->belongsTo(AdmKabupatenKota::class, 'kabupaten_kota_id');
    }

    public function desaKelurahan(): HasMany
    {
        return $this->hasMany(AdmDesaKelurahan::class, 'kecamatan_id');
    }

    public function kodePos(): HasMany
    {
        return $this->hasMany(AdmKodePos::class, 'kecamatan_id');
    }
}
