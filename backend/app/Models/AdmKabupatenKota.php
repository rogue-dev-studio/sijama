<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:29:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:29:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmKabupatenKota extends Model
{
    protected $table = 'adm_kabupaten_kota';

    protected $fillable = [
        'provinsi_id',
        'kode',
        'nama',
        'jenis',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function provinsi(): BelongsTo
    {
        return $this->belongsTo(AdmProvinsi::class, 'provinsi_id');
    }

    public function kecamatan(): HasMany
    {
        return $this->hasMany(AdmKecamatan::class, 'kabupaten_kota_id');
    }
}
