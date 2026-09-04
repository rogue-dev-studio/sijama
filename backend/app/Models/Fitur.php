<?php

namespace App\Models;

use App\Support\SuperAdminAccess;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fitur extends Model
{
    protected $table = 'fitur_m';

    protected $fillable = [
        'menu_id',
        'slug',
        'nama',
        'deskripsi',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (Fitur $fitur): void {
            SuperAdminAccess::provisionFitur($fitur);
        });
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    public function hakAkses(): HasMany
    {
        return $this->hasMany(HakAkses::class);
    }
}
