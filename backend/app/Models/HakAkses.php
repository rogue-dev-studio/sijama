<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class HakAkses extends Model
{
    protected $table = 'hak_akses';

    protected $fillable = [
        'fitur_id',
        'slug',
        'nama',
        'aksi',
    ];

    public function fitur(): BelongsTo
    {
        return $this->belongsTo(Fitur::class);
    }

    public function dapukan(): BelongsToMany
    {
        return $this->belongsToMany(Dapukan::class, 'dapukan_hak_akses')
            ->withTimestamps();
    }
}
