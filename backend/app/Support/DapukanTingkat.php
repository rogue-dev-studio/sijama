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

    public static function rank(?string $tingkat): ?int
    {
        if ($tingkat === null || $tingkat === '') {
            return null;
        }

        return self::ORDER[$tingkat] ?? null;
    }

    public static function isAdminSlug(?string $slug): bool
    {
        if ($slug === null || $slug === '') {
            return false;
        }

        if ($slug === 'superadmin') {
            return true;
        }

        return str_starts_with($slug, 'admin_');
    }

    /**
     * True if $candidate is same level or narrower (below) relative to $actor.
     * Broader levels (e.g. desa vs kelompok) return false.
     */
    public static function isAssignableBy(?string $candidateTingkat, ?string $actorTingkat): bool
    {
        $candidateRank = self::rank($candidateTingkat);
        $actorRank = self::rank($actorTingkat);

        if ($candidateRank === null || $actorRank === null) {
            return false;
        }

        return $candidateRank >= $actorRank;
    }

    /** @return list<string> */
    public static function tingkatAtOrBelow(?string $actorTingkat): array
    {
        $actorRank = self::rank($actorTingkat);

        if ($actorRank === null) {
            return [];
        }

        return array_keys(array_filter(
            self::ORDER,
            fn (int $rank) => $rank >= $actorRank
        ));
    }

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
