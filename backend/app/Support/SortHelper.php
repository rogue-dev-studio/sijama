<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 16:46:50
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:46:50
 */

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class SortHelper
{
    /**
     * @param  array<string, string>|list<string>  $allowed
     *         list of column names, or map request-key => sql-column
     */
    public static function apply(
        Builder $builder,
        ?string $sortBy,
        ?string $sortDir,
        array $allowed,
        string $defaultColumn,
        string $defaultDir = 'asc',
    ): Builder {
        $map = self::normalizeAllowed($allowed);
        $column = $sortBy && isset($map[$sortBy]) ? $map[$sortBy] : $defaultColumn;
        $dir = self::normalizeDir($sortDir, $defaultDir);

        return $builder->reorder($column, $dir);
    }

    /**
     * @return array{0: ?string, 1: ?string}
     */
    public static function fromRequest(Request $request): array
    {
        $sortBy = $request->query('sort_by');
        $sortDir = $request->query('sort_dir');

        return [
            is_string($sortBy) && $sortBy !== '' ? $sortBy : null,
            is_string($sortDir) && $sortDir !== '' ? $sortDir : null,
        ];
    }

    /**
     * @param  array<string, string>|list<string>  $allowed
     * @return array<string, string>
     */
    private static function normalizeAllowed(array $allowed): array
    {
        $map = [];
        foreach ($allowed as $key => $value) {
            if (is_int($key)) {
                $map[(string) $value] = (string) $value;
            } else {
                $map[(string) $key] = (string) $value;
            }
        }

        return $map;
    }

    private static function normalizeDir(?string $sortDir, string $defaultDir): string
    {
        $dir = strtolower((string) $sortDir);

        return in_array($dir, ['asc', 'desc'], true) ? $dir : $defaultDir;
    }
}
