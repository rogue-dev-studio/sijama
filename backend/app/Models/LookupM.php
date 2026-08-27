<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 09:21:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 09:21:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class LookupM extends Model
{
    protected $table = 'lookup_m';

    protected $primaryKey = 'lookup_id';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'lookup_type',
        'lookup_name',
        'lookup_value',
        'lookup_urutan',
        'lookup_kode',
        'additional_data',
        'created_date',
        'created_by',
        'modified_count',
        'last_modified_date',
        'last_modified_by',
        'is_deleted',
        'is_active',
        'deleted_date',
        'deleted_by',
    ];

    protected function casts(): array
    {
        return [
            'lookup_urutan' => 'integer',
            'created_by' => 'integer',
            'modified_count' => 'integer',
            'last_modified_by' => 'integer',
            'deleted_by' => 'integer',
            'is_deleted' => 'boolean',
            'is_active' => 'boolean',
            'created_date' => 'datetime',
            'last_modified_date' => 'datetime',
            'deleted_date' => 'datetime',
        ];
    }

    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('lookup_type', $type);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeNotDeleted(Builder $query): Builder
    {
        return $query->where('is_deleted', false);
    }
}
