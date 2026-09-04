<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:55:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppPollVote extends Model
{
    protected $table = 'app_poll_vote_t';

    public const UPDATED_AT = null;

    protected $fillable = [
        'poll_id',
        'option_id',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'poll_id' => 'integer',
            'option_id' => 'integer',
            'user_id' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function poll(): BelongsTo
    {
        return $this->belongsTo(AppPoll::class, 'poll_id');
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(AppPollOption::class, 'option_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
