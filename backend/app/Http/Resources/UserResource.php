<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $jamaahDapukan = $this->whenLoaded('jamaah') && $this->jamaah?->relationLoaded('dapukan')
            ? $this->jamaah->dapukan
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'is_active' => $this->is_active,
            'jamaah_id' => $this->jamaah_id,
            'jamaah' => $this->whenLoaded('jamaah', fn () => $this->jamaah ? [
                'id' => $this->jamaah->id,
                'nama' => $this->jamaah->nama,
                'email' => $this->jamaah->email,
                'no_hp' => $this->jamaah->no_hp,
                'dapukan' => $jamaahDapukan
                    ? $jamaahDapukan->map(fn ($item) => [
                        'id' => $item->id,
                        'slug' => $item->slug,
                        'nama' => $item->nama,
                        'tingkat' => $item->tingkat,
                    ])->values()->all()
                    : [],
            ] : null),
            'dapukan' => $this->whenLoaded('dapukan', fn () => $this->dapukan ? [
                'id' => $this->dapukan->id,
                'slug' => $this->dapukan->slug,
                'nama' => $this->dapukan->nama,
                'tingkat' => $this->dapukan->tingkat,
            ] : null),
            'dapukan_list' => $jamaahDapukan
                ? $jamaahDapukan->map(fn ($item) => [
                    'id' => $item->id,
                    'slug' => $item->slug,
                    'nama' => $item->nama,
                    'tingkat' => $item->tingkat,
                ])->values()->all()
                : ($this->relationLoaded('dapukan') && $this->dapukan ? [[
                    'id' => $this->dapukan->id,
                    'slug' => $this->dapukan->slug,
                    'nama' => $this->dapukan->nama,
                    'tingkat' => $this->dapukan->tingkat,
                ]] : []),
            'scope' => [
                'pusat' => $this->formatWilayahSummary('pusat'),
                'daerah' => $this->formatWilayahSummary('daerah'),
                'desa' => $this->formatWilayahSummary('desa'),
                'kelompok' => $this->formatWilayahSummary('kelompok'),
            ],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    private function formatWilayahSummary(string $relation): ?array
    {
        if (! $this->relationLoaded($relation) || ! $this->{$relation}) {
            return null;
        }

        $model = $this->{$relation};

        return [
            'id' => $model->id,
            'kode' => $model->kode,
            'nama' => $model->nama,
        ];
    }
}
