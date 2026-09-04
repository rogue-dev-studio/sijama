<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 14:10:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 14:10:53
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditActivity extends Model
{
    protected $table = 'audit_activity_t';

    public $timestamps = false;

    protected $fillable = [
        'module',
        'action',
        'entity_type',
        'entity_id',
        'entity_label',
        'actor_user_id',
        'actor_username',
        'summary',
        'meta',
        'ip_address',
        'user_agent',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'entity_id' => 'integer',
            'actor_user_id' => 'integer',
            'occurred_at' => 'datetime',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
