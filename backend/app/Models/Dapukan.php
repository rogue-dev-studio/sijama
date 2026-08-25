<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dapukan extends Model
{
    protected $table = 'dapukan';

    protected $fillable = [
        'slug',
        'nama',
        'deskripsi',
        'tingkat',
        'urutan',
        'is_system',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
            'is_system' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function jamaah(): BelongsToMany
    {
        return $this->belongsToMany(Jamaah::class, 'jamaah_dapukan')->withTimestamps();
    }

    public function hakAkses(): BelongsToMany
    {
        return $this->belongsToMany(HakAkses::class, 'dapukan_hak_akses')
            ->withTimestamps();
    }
}
