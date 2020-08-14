<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:40:00
 */

namespace App\Support;

use App\Models\Dapukan;
use Illuminate\Support\Collection;

final class DapukanTingkat
{
    public const ORDER = [
        'global' => 0,
        'pusat' => 1,
        'daerah' => 2,
        'desa' => 3,
        'kelompok' => 4,
    ];

    /** @param Collection<int, Dapukan>|iterable<Dapukan> $dapukan */
    public static function broadest(iterable $dapukan): ?Dapukan
    {
        $items = Collection::make($dapukan)->filter();

        if ($items->isEmpty()) {
            return null;
        }

        return $items
            ->sortBy(fn (Dapukan $item) => self::ORDER[$item->tingkat] ?? 99)
            ->first();
    }
}
