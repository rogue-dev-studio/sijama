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

class JamaahKeluarga extends Model
{
    protected $table = 'jamaah_keluarga';

    protected $fillable = [
        'keluarga_id',
        'jamaah_id',
        'hubungan_keluarga',
        'is_kepala_keluarga',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'is_kepala_keluarga' => 'boolean',
        ];
    }

    public function keluarga(): BelongsTo
    {
        return $this->belongsTo(Keluarga::class);
    }

    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class);
    }
}
