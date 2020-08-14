<?php

namespace App\DTOs;

readonly class CheckInData
{
    public function __construct(
        public int $jamaahId,
        public string $method,
        public ?float $matchedDistance,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            jamaahId: (int) $data['jamaah_id'],
            method: $data['method'],
            matchedDistance: isset($data['matched_distance']) ? (float) $data['matched_distance'] : null,
        );
    }
}
