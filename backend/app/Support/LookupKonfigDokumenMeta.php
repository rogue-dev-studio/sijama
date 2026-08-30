<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 16:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 16:05:00
 */

namespace App\Support;

class LookupKonfigDokumenMeta
{
    /** @return array{paper_size: string, paper_orientation: string} */
    public static function defaults(): array
    {
        return [
            'paper_size' => 'a4',
            'paper_orientation' => 'portrait',
        ];
    }

    /**
     * @return array{paper_size: string, paper_orientation: string}
     */
    public static function parse(?string $additionalData): array
    {
        if ($additionalData === null || trim($additionalData) === '') {
            return self::defaults();
        }

        $decoded = json_decode($additionalData, true);
        if (! is_array($decoded)) {
            return self::defaults();
        }

        return self::normalize($decoded);
    }

    /**
     * @param  array<string, mixed>  $raw
     * @return array{paper_size: string, paper_orientation: string}
     */
    public static function normalize(array $raw): array
    {
        $defaults = self::defaults();

        return [
            'paper_size' => DocumentHeaderStyle::normalizePaperSize(
                $raw['paper_size'] ?? null,
                (string) $defaults['paper_size'],
            ),
            'paper_orientation' => DocumentHeaderStyle::normalizePaperOrientation(
                $raw['paper_orientation'] ?? null,
                (string) $defaults['paper_orientation'],
            ),
        ];
    }

    /**
     * @param  array{paper_size?: mixed, paper_orientation?: mixed}  $meta
     */
    public static function serialize(array $meta): string
    {
        return json_encode(self::normalize($meta), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }

    public static function normalizePaperSize(mixed $value, ?string $fallback = null): string
    {
        return DocumentHeaderStyle::normalizePaperSize($value, $fallback ?? 'a4');
    }

    public static function normalizePaperOrientation(mixed $value, ?string $fallback = null): string
    {
        return DocumentHeaderStyle::normalizePaperOrientation($value, $fallback ?? 'portrait');
    }
}
