<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:34:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:34:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pusat extends Model
{
    protected $table = 'wilayah_fung_pusat_m';

    protected $fillable = [
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

    public function wilayahFungDaerah(): HasMany
    {
        return $this->hasMany(Daerah::class, 'wilayah_fung_pusat_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'wilayah_fung_pusat_id');
    }
}
