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
    protected $table = 'adm_provinsi';

    protected $fillable = [
        'negara_id',
        'kode',
        'nama',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function negara(): BelongsTo
    {
        return $this->belongsTo(AdmNegara::class, 'negara_id');
    }

    public function kabupatenKota(): HasMany
    {
        return $this->hasMany(AdmKabupatenKota::class, 'provinsi_id');
    }
}
