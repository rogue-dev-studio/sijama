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
use Illuminate\Database\Eloquent\Relations\HasMany;

class AppPollOption extends Model
{
    protected $table = 'app_poll_option_t';

    public $timestamps = false;

    protected $fillable = [
        'poll_id',
        'label',
        'urutan',
    ];

    protected function casts(): array
    {
        return [
            'poll_id' => 'integer',
            'urutan' => 'integer',
        ];
    }

    public function poll(): BelongsTo
    {
        return $this->belongsTo(AppPoll::class, 'poll_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(AppPollVote::class, 'option_id');
    }
}
