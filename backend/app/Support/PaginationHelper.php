<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class PaginationHelper
{
    public const DEFAULT_PER_PAGE = 10;

    public const MIN_PER_PAGE = 5;

    public const MAX_PER_PAGE = 10000;

    public static function resolvePerPage(?int $perPage): int
    {
        if ($perPage === null || $perPage < self::MIN_PER_PAGE) {
            return self::DEFAULT_PER_PAGE;
        }

        return min($perPage, self::MAX_PER_PAGE);
    }

    public static function resolvePage(?int $page): int
    {
        return max(1, $page ?? 1);
    }

    public static function paginate(Builder $query, ?int $perPage = null, ?int $page = null): LengthAwarePaginator
    {
        return $query->paginate(
            self::resolvePerPage($perPage),
            ['*'],
            'page',
            self::resolvePage($page),
        );
    }

    /**
     * @return array{items: mixed, meta: array{current_page: int, last_page: int, per_page: int, total: int}}
     */
    public static function envelope(LengthAwarePaginator $paginator, mixed $items): array
    {
        return [
            'items' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ];
    }
}
