<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 17:41:32
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:55:00
 */

namespace App\Support;

class DocumentHeaderStyle
{
    public const LAYOUT_BIASA = 'biasa';

    public const LAYOUT_KOP_GANDA = 'kop_ganda';

    public const LAYOUT_KOP_KIRI = 'kop_kiri';

    public const LAYOUT_KOP_KANAN = 'kop_kanan';

    public const LAYOUT_KOP_ATAS = 'kop_atas';

    /** @deprecated gunakan LAYOUT_BIASA */
    public const LAYOUT_SEDERHANA = 'sederhana';

    /** @deprecated gunakan LAYOUT_KOP_GANDA */
    public const LAYOUT_KOP = 'kop';

    /** @return list<string> */
    public static function layoutModes(): array
    {
        return [
            self::LAYOUT_BIASA,
            self::LAYOUT_KOP_GANDA,
            self::LAYOUT_KOP_KIRI,
            self::LAYOUT_KOP_KANAN,
            self::LAYOUT_KOP_ATAS,
        ];
    }

    /** @return array<string, int|string> */
    public static function defaults(): array
    {
        return [
            'header_font_size' => 17,
            'header_font_weight' => '650',
            'header_align' => 'center',
            'header_detail_font_size' => 14,
            'header_detail_font_weight' => '400',
            'header_detail_color' => '#444444',
            'logo_max_height' => 64,
            'footer_font_size' => 13,
        ];
    }

    /**
     * @param  mixed  $raw
     * @return array<string, int|string>
     */
    public static function normalize(mixed $raw): array
    {
        $defaults = self::defaults();
        if (! is_array($raw)) {
            return $defaults;
        }

        $align = strtolower((string) ($raw['header_align'] ?? $defaults['header_align']));
        if (! in_array($align, ['left', 'center', 'right'], true)) {
            $align = 'center';
        }

        return [
            'header_font_size' => self::clampInt($raw['header_font_size'] ?? null, 8, 48, (int) $defaults['header_font_size']),
            'header_font_weight' => self::normalizeWeight($raw['header_font_weight'] ?? null, (string) $defaults['header_font_weight']),
            'header_align' => $align,
            'header_detail_font_size' => self::clampInt($raw['header_detail_font_size'] ?? null, 8, 36, (int) $defaults['header_detail_font_size']),
            'header_detail_font_weight' => self::normalizeWeight($raw['header_detail_font_weight'] ?? null, (string) $defaults['header_detail_font_weight']),
            'header_detail_color' => self::normalizeColor($raw['header_detail_color'] ?? null, (string) $defaults['header_detail_color']),
            'logo_max_height' => self::clampInt($raw['logo_max_height'] ?? null, 24, 160, (int) $defaults['logo_max_height']),
            'footer_font_size' => self::clampInt($raw['footer_font_size'] ?? null, 8, 24, (int) $defaults['footer_font_size']),
        ];
    }

    public static function normalizeLayoutMode(?string $mode): string
    {
        $value = strtolower(trim((string) $mode));

        return match ($value) {
            'sederhana', 'biasa' => self::LAYOUT_BIASA,
            'kop', 'kop_ganda' => self::LAYOUT_KOP_GANDA,
            'kop_kiri' => self::LAYOUT_KOP_KIRI,
            'kop_kanan' => self::LAYOUT_KOP_KANAN,
            'kop_atas' => self::LAYOUT_KOP_ATAS,
            default => self::LAYOUT_KOP_GANDA,
        };
    }

    public static function usesLogos(?string $mode): bool
    {
        return self::normalizeLayoutMode($mode) !== self::LAYOUT_BIASA;
    }

    private static function clampInt(mixed $value, int $min, int $max, int $default): int
    {
        if ($value === null || $value === '') {
            return $default;
        }

        $n = (int) $value;

        return max($min, min($max, $n));
    }

    private static function normalizeWeight(mixed $value, string $default): string
    {
        $allowed = ['400', '500', '600', '650', '700', '800'];
        $w = (string) ($value ?? '');

        return in_array($w, $allowed, true) ? $w : $default;
    }

    private static function normalizeColor(mixed $value, string $default): string
    {
        $color = trim((string) ($value ?? ''));
        if (preg_match('/^#[0-9A-Fa-f]{6}$/', $color) === 1) {
            return strtoupper($color);
        }

        return $default;
    }
}
