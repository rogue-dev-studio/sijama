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
    protected $table = 'wilayah_adm_kabupaten_kota_m';

    protected $fillable = [
        'wilayah_adm_provinsi_id',
        'kode',
        'nama',
        'jenis',
        'singkatan',
        'singkatan_kawasan_metropolitan',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function wilayahAdmProvinsi(): BelongsTo
    {
        return $this->belongsTo(AdmProvinsi::class, 'wilayah_adm_provinsi_id');
    }

    public function wilayahAdmKecamatan(): HasMany
    {
        return $this->hasMany(AdmKecamatan::class, 'wilayah_adm_kabupaten_kota_id');
    }
}
