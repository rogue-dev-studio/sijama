<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Desa extends Model
{
    protected $table = 'wilayah_fung_desa_m';

    protected $fillable = [
        'wilayah_fung_daerah_id',
        'kode',
        'nama',
        'singkatan',
        'deskripsi',
        'is_active',
        'wilayah_adm_desa_id',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function wilayahFungDaerah(): BelongsTo
    {
        return $this->belongsTo(Daerah::class, 'wilayah_fung_daerah_id');
    }

    public function wilayahAdmDesa(): BelongsTo
    {
        return $this->belongsTo(AdmDesaKelurahan::class, 'wilayah_adm_desa_id');
    }

    public function wilayahFungKelompok(): HasMany
    {
        return $this->hasMany(Kelompok::class, 'wilayah_fung_desa_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'wilayah_fung_desa_id');
    }
}
