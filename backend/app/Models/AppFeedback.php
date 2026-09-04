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

class AppFeedback extends Model
{
    protected $table = 'app_feedback_t';

    protected $fillable = [
        'kind',
        'reporter_name',
        'reporter_username',
        'user_id',
        'jamaah_id',
        'contact',
        'title',
        'body',
        'rating',
        'role_label',
        'images_json',
        'is_published',
        'status',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'jamaah_id' => 'integer',
            'rating' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class, 'jamaah_id');
    }
}
