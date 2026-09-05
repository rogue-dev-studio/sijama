<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-05 19:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-05 19:45:00
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public gallery payload — no username, email/phone, or nested account PII.
 */
class AppFeedbackGalleryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind,
            'reporter_name' => $this->reporter_name,
            'title' => $this->title,
            'body' => $this->body,
            'rating' => $this->rating,
            'role_label' => $this->role_label,
            'images' => $this->decodeImages(),
            'created_at' => $this->created_at?->toIso8601String(),
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
