<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 13:52:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:46:40
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppErrorLog extends Model
{
    protected $table = 'app_error_log_t';

    public $timestamps = false;

    protected $fillable = [
        'level',
        'status',
        'status_note',
        'status_updated_at',
        'status_updated_by',
        'exception_class',
        'message',
        'file',
        'line',
        'stack_trace',
        'request_method',
        'request_path',
        'user_id',
        'ip_address',
        'user_agent',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'line' => 'integer',
            'user_id' => 'integer',
            'status_updated_by' => 'integer',
            'occurred_at' => 'datetime',
            'status_updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function statusUpdatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'status_updated_by');
    }
}
