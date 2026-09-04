<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubKelompok extends Model
{
    protected $table = 'wilayah_fung_sub_kelompok_m';

    protected $fillable = [
        'wilayah_fung_kelompok_id',
        'kode',
        'nama',
        'singkatan',
        'deskripsi',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function wilayahFungKelompok(): BelongsTo
    {
        return $this->belongsTo(Kelompok::class, 'wilayah_fung_kelompok_id');
    }
}
