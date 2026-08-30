<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:52:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:06:32
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KonfigDokumenK extends Model
{
    protected $table = 'konfigdokumen_k';

    protected $primaryKey = 'konfigdokumen_id';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'lookup_id',
        'additional_data',
        'created_date',
        'created_by',
        'modified_count',
        'last_modified_date',
        'last_modified_by',
        'is_active',
        'is_deleted',
        'deleted_date',
        'deleted_by',
        'header',
        'header_detail',
        'footer',
        'footer_detail',
        'path_logo_kiri',
        'path_logo_kanan',
        'layout_mode',
        'header_style',
        'paper_size',
        'paper_orientation',
        'apply_pdf',
        'apply_excel',
        'apply_csv',
        'show_print_date',
        'print_date_label',
        'show_print_row_count',
        'show_generated_by',
        'column_visibility',
        'show_user_signature',
        'show_user_name',
        'show_user_phone',
    ];

    protected function casts(): array
    {
        return [
            'lookup_id' => 'integer',
            'created_by' => 'integer',
            'modified_count' => 'integer',
            'last_modified_by' => 'integer',
            'deleted_by' => 'integer',
            'is_active' => 'boolean',
            'is_deleted' => 'boolean',
            'apply_pdf' => 'boolean',
            'apply_excel' => 'boolean',
            'apply_csv' => 'boolean',
            'show_print_date' => 'boolean',
            'show_print_row_count' => 'boolean',
            'show_generated_by' => 'boolean',
            'column_visibility' => 'array',
            'show_user_signature' => 'boolean',
            'show_user_name' => 'boolean',
            'show_user_phone' => 'boolean',
            'header_style' => 'array',
            'created_date' => 'datetime',
            'last_modified_date' => 'datetime',
            'deleted_date' => 'datetime',
        ];
    }

    public function lookup(): BelongsTo
    {
        return $this->belongsTo(LookupM::class, 'lookup_id', 'lookup_id');
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
