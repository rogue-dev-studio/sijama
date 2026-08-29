<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 12:28:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:28:00
 */

namespace App\Services;

use App\Models\LookupM;
use App\Support\LookupTypes;

class LookupOptionsService
{
    /**
     * @param  array<int, string>  $types
     * @return array<string, array<int, array{id: int, name: string, value: string|null, kode: string|null}>>
     */
    public function byTypes(array $types): array
    {
        $allowed = LookupTypes::OPTION_TYPES;
        $normalized = [];

        foreach ($types as $type) {
            $type = trim((string) $type);
            if ($type !== '' && in_array($type, $allowed, true)) {
                $normalized[$type] = $type;
            }
        }

        if ($normalized === []) {
            $normalized = array_combine($allowed, $allowed) ?: [];
        }

        $rows = LookupM::query()
            ->notDeleted()
            ->active()
            ->whereIn('lookup_type', array_values($normalized))
            ->orderBy('lookup_type')
            ->orderBy('lookup_urutan')
            ->orderBy('lookup_name')
            ->get(['lookup_id', 'lookup_type', 'lookup_name', 'lookup_value', 'lookup_kode']);

        $result = [];
        foreach (array_values($normalized) as $type) {
            $result[$type] = [];
        }

        foreach ($rows as $row) {
            $result[$row->lookup_type][] = [
                'id' => (int) $row->lookup_id,
                'name' => (string) ($row->lookup_name ?: $row->lookup_value ?: ''),
                'value' => $row->lookup_value,
                'kode' => $row->lookup_kode,
            ];
        }

        return $result;
    }
}
