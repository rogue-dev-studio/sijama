<?php

namespace App\DTOs;

readonly class OpenSessionData
{
    public function __construct(
        public string $type,
        public int $refId,
        public string $title,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            type: $data['type'],
            refId: (int) $data['ref_id'],
            title: $data['title'],
        );
    }
}
