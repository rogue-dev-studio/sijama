<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:31:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:31:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmKodePos extends Model
{
    protected $table = 'wilayah_adm_kode_pos_m';

    protected $fillable = [
        'kode',
        'wilayah_adm_desa_id',
        'wilayah_adm_kecamatan_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function wilayahAdmDesa(): BelongsTo
    {
        return $this->belongsTo(AdmDesaKelurahan::class, 'wilayah_adm_desa_id');
    }

    public function wilayahAdmKecamatan(): BelongsTo
    {
        return $this->belongsTo(AdmKecamatan::class, 'wilayah_adm_kecamatan_id');
    }
}
