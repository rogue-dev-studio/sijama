<?php

/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:42:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:42:00
 */

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class SearchHelper
{
    public static function like(Builder $query, string $column, string $term): Builder
    {
        $driver = DB::connection()->getDriverName();
        $operator = $driver === 'pgsql' ? 'ilike' : 'like';

        return $query->where($column, $operator, '%'.$term.'%');
    }

    public static function likeGroup(Builder $query, array $columns, string $term): Builder
    {
        $driver = DB::connection()->getDriverName();
        $operator = $driver === 'pgsql' ? 'ilike' : 'like';

        return $query->where(function (Builder $inner) use ($columns, $term, $operator) {
            foreach ($columns as $index => $column) {
                if ($index === 0) {
                    $inner->where($column, $operator, '%'.$term.'%');
                } else {
                    $inner->orWhere($column, $operator, '%'.$term.'%');
                }
            }
        });
    }
}
