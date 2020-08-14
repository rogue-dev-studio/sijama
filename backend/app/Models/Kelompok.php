<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kelompok extends Model
{
    protected $table = 'kelompok';

    protected $fillable = [
        'desa_id',
        'kode',
        'nama',
        'deskripsi',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class);
    }

    public function jamaah(): HasMany
    {
        return $this->hasMany(Jamaah::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function subKelompok(): HasMany
    {
        return $this->hasMany(SubKelompok::class);
    }
}
