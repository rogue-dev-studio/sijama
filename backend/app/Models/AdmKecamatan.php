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
    protected $table = 'wilayah_adm_kecamatan_m';

    protected $fillable = [
        'wilayah_adm_kabupaten_kota_id',
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

    public function wilayahAdmKabupatenKota(): BelongsTo
    {
        return $this->belongsTo(AdmKabupatenKota::class, 'wilayah_adm_kabupaten_kota_id');
    }

    public function wilayahAdmDesa(): HasMany
    {
        return $this->hasMany(AdmDesaKelurahan::class, 'wilayah_adm_kecamatan_id');
    }

    public function kodePos(): HasMany
    {
        return $this->hasMany(AdmKodePos::class, 'wilayah_adm_kecamatan_id');
    }
}
