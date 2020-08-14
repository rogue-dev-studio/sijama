<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Daerah extends Model
{
    protected $table = 'daerah';

    protected $fillable = [
        'pusat_id',
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

    public function pusat(): BelongsTo
    {
        return $this->belongsTo(Pusat::class);
    }

    public function desa(): HasMany
    {
        return $this->hasMany(Desa::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
