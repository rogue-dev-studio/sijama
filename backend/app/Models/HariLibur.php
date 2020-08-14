<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 17:45:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HariLibur extends Model
{
    protected $table = 'hari_libur';

    protected $fillable = [
        'tanggal',
        'nama',
        'jenis',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'is_active' => 'boolean',
        ];
    }
}
