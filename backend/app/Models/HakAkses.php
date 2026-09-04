<?php

namespace App\Models;

use App\Support\SuperAdminAccess;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class HakAkses extends Model
{
    protected $table = 'hak_akses_m';

    protected $fillable = [
        'fitur_id',
        'slug',
        'nama',
        'aksi',
    ];

    protected static function booted(): void
    {
        static::created(function (HakAkses $hakAkses): void {
            SuperAdminAccess::grant($hakAkses);
        });
    }

    public function fitur(): BelongsTo
    {
        return $this->belongsTo(Fitur::class);
    }

    public function dapukan(): BelongsToMany
    {
        return $this->belongsToMany(Dapukan::class, 'dapukan_hak_akses_mp')
            ->withTimestamps();
    }
}
