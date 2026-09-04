<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:20:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category,
            'reporter_name' => $this->reporter_name,
            'reporter_username' => $this->reporter_username,
            'user_id' => $this->user_id,
            'jamaah_id' => $this->jamaah_id,
            'subject' => $this->subject,
            'description' => $this->description,
            'contact' => $this->contact,
            'images' => $this->decodeImages(),
            'status' => $this->status,
            'admin_notes' => $this->admin_notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'username' => $this->user->username,
            ] : null),
            'jamaah' => $this->whenLoaded('jamaah', fn () => $this->jamaah ? [
                'id' => $this->jamaah->id,
                'nama' => $this->jamaah->nama,
            ] : null),
        ];
    }

    /** @return list<string> */
    private function decodeImages(): array
    {
        if (! filled($this->images_json)) {
            return [];
        }
        $decoded = json_decode((string) $this->images_json, true);

        return is_array($decoded) ? array_values(array_filter($decoded, 'is_string')) : [];
    }
}
