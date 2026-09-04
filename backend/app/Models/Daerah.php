<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Daerah extends Model
{
    protected $table = 'wilayah_fung_daerah_m';

    protected $fillable = [
        'wilayah_fung_pusat_id',
        'kode',
        'nama',
        'singkatan',
        'deskripsi',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function wilayahFungPusat(): BelongsTo
    {
        return $this->belongsTo(Pusat::class, 'wilayah_fung_pusat_id');
    }

    public function wilayahFungDesa(): HasMany
    {
        return $this->hasMany(Desa::class, 'wilayah_fung_daerah_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'wilayah_fung_daerah_id');
    }
}
