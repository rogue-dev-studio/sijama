<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 15:51:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 15:51:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntegrationLog extends Model
{
    protected $table = 'integration_log_t';

    public $timestamps = false;

    protected $fillable = [
        'provider',
        'level',
        'event_type',
        'title',
        'message',
        'context_json',
        'occurred_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'created_by' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return array<string, mixed>|null */
    public function context(): ?array
    {
        if (! filled($this->context_json)) {
            return null;
        }

        $decoded = json_decode((string) $this->context_json, true);

        return is_array($decoded) ? $decoded : null;
    }
}
