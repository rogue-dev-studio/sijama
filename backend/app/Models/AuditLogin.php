<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 13:36:09
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 13:36:09
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLogin extends Model
{
    protected $table = 'audit_login_t';

    public $timestamps = false;

    protected $fillable = [
        'event',
        'success',
        'username',
        'user_id',
        'failure_reason',
        'ip_address',
        'user_agent',
        'remember_me',
        'device_key',
        'personal_access_token_id',
        'attempted_at',
    ];

    protected function casts(): array
    {
        return [
            'success' => 'boolean',
            'remember_me' => 'boolean',
            'user_id' => 'integer',
            'personal_access_token_id' => 'integer',
            'attempted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
