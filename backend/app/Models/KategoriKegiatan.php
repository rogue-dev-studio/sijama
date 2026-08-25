<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriKegiatan extends Model
{
    protected $table = 'kategori_kegiatan';

    protected $fillable = [
        'nama',
        'deskripsi',
        'calendar_color',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function kegiatan(): HasMany
    {
        return $this->hasMany(Kegiatan::class, 'kategori_kegiatan_id');
    }

    public function pengajian(): HasMany
    {
        return $this->hasMany(Pengajian::class, 'kategori_kegiatan_id');
    }
}
