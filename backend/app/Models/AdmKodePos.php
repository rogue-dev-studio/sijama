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
    protected $table = 'adm_kode_pos';

    protected $fillable = [
        'kode',
        'desa_kelurahan_id',
        'kecamatan_id',
        'nama_wilayah',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function desaKelurahan(): BelongsTo
    {
        return $this->belongsTo(AdmDesaKelurahan::class, 'desa_kelurahan_id');
    }

    public function kecamatan(): BelongsTo
    {
        return $this->belongsTo(AdmKecamatan::class, 'kecamatan_id');
    }
}
