<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:23:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:23:49
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LookupMResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->lookup_id,
            'lookup_id' => $this->lookup_id,
            'lookup_type' => $this->lookup_type,
            'lookup_name' => $this->lookup_name,
            'nama' => $this->lookup_name ?? '',
            'lookup_value' => $this->lookup_value,
            'lookup_urutan' => $this->lookup_urutan,
            'lookup_kode' => $this->lookup_kode,
            'additional_data' => $this->additional_data,
            'created_date' => $this->created_date?->toIso8601String(),
            'created_by' => $this->created_by,
            'modified_count' => $this->modified_count,
            'last_modified_date' => $this->last_modified_date?->toIso8601String(),
            'last_modified_by' => $this->last_modified_by,
            'is_deleted' => $this->is_deleted,
            'is_active' => $this->is_active,
            'deleted_date' => $this->deleted_date?->toIso8601String(),
            'deleted_by' => $this->deleted_by,
        ];
    }
}
