<?php

namespace App\Models;

use App\Support\SuperAdminAccess;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $table = 'menu_m';

    protected $fillable = [
        'parent_id',
        'slug',
        'nama',
        'path',
        'icon',
        'urutan',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (Menu $menu): void {
            SuperAdminAccess::provisionMenu($menu);
        });
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id')->orderBy('urutan');
    }

    public function fiturs(): HasMany
    {
        return $this->hasMany(Fitur::class);
    }
}
