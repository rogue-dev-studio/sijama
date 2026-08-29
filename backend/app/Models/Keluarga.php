<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Keluarga extends Model
{
    use SoftDeletes;

    protected $table = 'keluarga';

    protected $fillable = [
        'kelompok_id',
        'kepala_jamaah_id',
        'no_kk',
        'alamat',
        'rt',
        'rw',
        'adm_desa_kelurahan_id',
        'kode_pos',
        'catatan',
        'status',
    ];

    public function kelompok(): BelongsTo
    {
        return $this->belongsTo(Kelompok::class);
    }

    public function kepalaJamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class, 'kepala_jamaah_id');
    }

    public function admDesaKelurahan(): BelongsTo
    {
        return $this->belongsTo(AdmDesaKelurahan::class, 'adm_desa_kelurahan_id');
    }

    public function anggotaPivot(): HasMany
    {
        return $this->hasMany(JamaahKeluarga::class);
    }

    public function anggota(): BelongsToMany
    {
        return $this->belongsToMany(Jamaah::class, 'jamaah_keluarga')
            ->withPivot(['hubungan_keluarga', 'is_kepala_keluarga', 'catatan'])
            ->withTimestamps();
    }
}
