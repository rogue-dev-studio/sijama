<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:40:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Materi extends Model
{
    protected $table = 'materi_m';

    protected $fillable = [
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

    public function kegiatan(): BelongsToMany
    {
        return $this->belongsToMany(Kegiatan::class, 'kegiatan_materi_mp');
    }
}
