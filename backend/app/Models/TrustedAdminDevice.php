<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:05:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrustedAdminDevice extends Model
{
    protected $fillable = [
        'user_id',
        'device_key',
        'ip_address',
        'user_agent',
        'last_seen_at',
    ];

    protected function casts(): array
    {
        return [
            'last_seen_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
