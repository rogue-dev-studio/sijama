<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 12:28:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:28:00
 */

namespace App\Support;

use App\Models\LookupM;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

final class LookupRules
{
    public static function activeValue(string $lookupType): Exists
    {
        return Rule::exists('lookup_m', 'lookup_value')
            ->where(fn ($query) => $query
                ->where('lookup_type', $lookupType)
                ->where('is_deleted', false)
                ->where('is_active', true));
    }

    public static function activeId(string $lookupType): Exists
    {
        return Rule::exists('lookup_m', 'lookup_id')
            ->where(fn ($query) => $query
                ->where('lookup_type', $lookupType)
                ->where('is_deleted', false)
                ->where('is_active', true));
    }

    public static function label(string $lookupType, ?string $value): string
    {
        if ($value === null || $value === '') {
            return '—';
        }

        $name = LookupM::query()
            ->notDeleted()
            ->byType($lookupType)
            ->where('lookup_value', $value)
            ->value('lookup_name');

        return $name ?: $value;
    }
}
