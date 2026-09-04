<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:33:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:33:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmProvinsi extends Model
{
    protected $table = 'wilayah_adm_provinsi_m';

    protected $fillable = [
        'wilayah_adm_negara_id',
        'kode',
        'nama',
        'singkatan',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function wilayahAdmNegara(): BelongsTo
    {
        return $this->belongsTo(AdmNegara::class, 'wilayah_adm_negara_id');
    }

    public function wilayahAdmKabupatenKota(): HasMany
    {
        return $this->hasMany(AdmKabupatenKota::class, 'wilayah_adm_provinsi_id');
    }
}
