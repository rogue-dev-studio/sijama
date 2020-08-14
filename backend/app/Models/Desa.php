<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Desa extends Model
{
    protected $table = 'desa';

    protected $fillable = [
        'daerah_id',
        'kode',
        'nama',
        'deskripsi',
        'is_active',
        'adm_desa_kelurahan_id',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function daerah(): BelongsTo
    {
        return $this->belongsTo(Daerah::class);
    }

    public function admDesaKelurahan(): BelongsTo
    {
        return $this->belongsTo(AdmDesaKelurahan::class, 'adm_desa_kelurahan_id');
    }

    public function kelompok(): HasMany
    {
        return $this->hasMany(Kelompok::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
