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
    protected $table = 'adm_negara';

    protected $fillable = [
        'kode',
        'nama',
        'iso3',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function provinsi(): HasMany
    {
        return $this->hasMany(AdmProvinsi::class, 'negara_id');
    }
}
