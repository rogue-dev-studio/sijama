<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:06:41
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lokasi extends Model
{
    protected $table = 'lokasi_m';

    protected $fillable = [
        'nama',
        'jenis',
        'kota',
        'wilayah_adm_desa_id',
        'alamat',
        'lat',
        'lng',
        'maps_place_id',
        'maps_place_name',
        'maps_url',
        'deskripsi',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
            'is_active' => 'boolean',
        ];
    }

    public function wilayahAdmDesa(): BelongsTo
    {
        return $this->belongsTo(AdmDesaKelurahan::class, 'wilayah_adm_desa_id');
    }

    public function kegiatan(): HasMany
    {
        return $this->hasMany(Kegiatan::class);
    }
}
