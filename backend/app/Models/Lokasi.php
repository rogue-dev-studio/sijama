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
    protected $table = 'lokasi';

    protected $fillable = [
        'nama',
        'jenis',
        'kota',
        'adm_desa_kelurahan_id',
        'alamat',
        'lat',
        'lng',
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

    public function admDesaKelurahan(): BelongsTo
    {
        return $this->belongsTo(AdmDesaKelurahan::class, 'adm_desa_kelurahan_id');
    }

    public function pengajian(): HasMany
    {
        return $this->hasMany(Pengajian::class);
    }

    public function kegiatan(): HasMany
    {
        return $this->hasMany(Kegiatan::class);
    }
}
