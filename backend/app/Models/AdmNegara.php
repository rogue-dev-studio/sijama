<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:32:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:32:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmNegara extends Model
{
    protected $table = 'wilayah_adm_negara_m';

    protected $fillable = [
        'kode',
        'nama',
        'iso3',
        'singkatan',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function wilayahAdmProvinsi(): HasMany
    {
        return $this->hasMany(AdmProvinsi::class, 'wilayah_adm_negara_id');
    }
}
