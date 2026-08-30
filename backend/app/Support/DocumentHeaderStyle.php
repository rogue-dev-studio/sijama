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
            'header_font_family' => 'times-new-roman',
            'header_font_size' => 17,
            'header_font_weight' => '650',
            'header_align' => 'center',
            'header_color' => '#111111',
            'header_text_transform' => 'none',
            'header_letter_spacing' => 0,
            'header_font_style' => 'normal',
            'header_underline' => false,
            'header_strikethrough' => false,
            'header_line_height' => 1.15,
            'header_detail_font_family' => 'times-new-roman',
            'header_detail_font_size' => 14,
            'header_detail_font_weight' => '400',
            'header_detail_color' => '#444444',
            'header_detail_align' => 'center',
            'header_detail_text_transform' => 'none',
            'header_detail_letter_spacing' => 0,
            'header_detail_font_style' => 'normal',
            'header_detail_underline' => false,
            'header_detail_strikethrough' => false,
            'header_detail_line_height' => 1.15,
            'logo_max_height' => 64,
            'logo_max_width' => 88,
            'brand_border_width' => 1,
            'brand_border_color' => '#DDDDDD',
            'footer_font_family' => 'times-new-roman',
            'footer_font_size' => 13,
            'footer_font_weight' => '400',
            'footer_text_transform' => 'none',
            'footer_letter_spacing' => 0,
            'footer_font_style' => 'normal',
            'footer_underline' => false,
            'footer_strikethrough' => false,
            'footer_line_height' => 1.15,
            'body_font_family' => 'arial',
            'body_font_size' => 11,
            'body_font_weight' => '400',
            'body_color' => '#111111',
            'body_font_style' => 'normal',
            'body_line_height' => 1.25,
            'body_align' => 'left',
            'sign_block_position' => 'center',
            'sign_content_align' => 'center',
            'sign_meta_layout' => 'stack',
            'sign_meta_order' => 'name_first',
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
        if (! in_array($align, ['left', 'center', 'right', 'justify'], true)) {
            $align = 'center';
        }

        $detailAlign = strtolower((string) ($raw['header_detail_align'] ?? $align));
        if (! in_array($detailAlign, ['left', 'center', 'right', 'justify'], true)) {
            $detailAlign = $align;
        }

        return [
            'header_font_family' => self::normalizeFontFamily($raw['header_font_family'] ?? null, (string) $defaults['header_font_family']),
            'header_font_size' => self::clampInt($raw['header_font_size'] ?? null, 8, 48, (int) $defaults['header_font_size']),
            'header_font_weight' => self::normalizeWeight($raw['header_font_weight'] ?? null, (string) $defaults['header_font_weight']),
            'header_align' => $align,
            'header_color' => self::normalizeColor($raw['header_color'] ?? null, (string) $defaults['header_color']),
            'header_text_transform' => self::normalizeTextTransform($raw['header_text_transform'] ?? null, (string) $defaults['header_text_transform']),
            'header_letter_spacing' => self::clampInt($raw['header_letter_spacing'] ?? null, -2, 12, (int) $defaults['header_letter_spacing']),
            'header_font_style' => self::normalizeFontStyle($raw['header_font_style'] ?? null, (string) $defaults['header_font_style']),
            'header_underline' => self::normalizeBool($raw['header_underline'] ?? null, (bool) $defaults['header_underline']),
            'header_strikethrough' => self::normalizeBool($raw['header_strikethrough'] ?? null, (bool) $defaults['header_strikethrough']),
            'header_line_height' => self::clampFloat($raw['header_line_height'] ?? null, 1.0, 2.5, (float) $defaults['header_line_height']),
            'header_detail_font_family' => self::normalizeFontFamily($raw['header_detail_font_family'] ?? null, (string) $defaults['header_detail_font_family']),
            'header_detail_font_size' => self::clampInt($raw['header_detail_font_size'] ?? null, 8, 36, (int) $defaults['header_detail_font_size']),
            'header_detail_font_weight' => self::normalizeWeight($raw['header_detail_font_weight'] ?? null, (string) $defaults['header_detail_font_weight']),
            'header_detail_color' => self::normalizeColor($raw['header_detail_color'] ?? null, (string) $defaults['header_detail_color']),
            'header_detail_align' => $detailAlign,
            'header_detail_text_transform' => self::normalizeTextTransform($raw['header_detail_text_transform'] ?? null, (string) $defaults['header_detail_text_transform']),
            'header_detail_letter_spacing' => self::clampInt($raw['header_detail_letter_spacing'] ?? null, -2, 12, (int) $defaults['header_detail_letter_spacing']),
            'header_detail_font_style' => self::normalizeFontStyle($raw['header_detail_font_style'] ?? null, (string) $defaults['header_detail_font_style']),
            'header_detail_underline' => self::normalizeBool($raw['header_detail_underline'] ?? null, (bool) $defaults['header_detail_underline']),
            'header_detail_strikethrough' => self::normalizeBool($raw['header_detail_strikethrough'] ?? null, (bool) $defaults['header_detail_strikethrough']),
            'header_detail_line_height' => self::clampFloat($raw['header_detail_line_height'] ?? null, 1.0, 2.5, (float) $defaults['header_detail_line_height']),
            'logo_max_height' => self::clampInt($raw['logo_max_height'] ?? null, 24, 160, (int) $defaults['logo_max_height']),
            'logo_max_width' => self::clampInt($raw['logo_max_width'] ?? null, 40, 240, (int) $defaults['logo_max_width']),
            'brand_border_width' => self::clampInt($raw['brand_border_width'] ?? null, 0, 4, (int) $defaults['brand_border_width']),
            'brand_border_color' => self::normalizeColor($raw['brand_border_color'] ?? null, (string) $defaults['brand_border_color']),
            'footer_font_family' => self::normalizeFontFamily($raw['footer_font_family'] ?? null, (string) $defaults['footer_font_family']),
            'footer_font_size' => self::clampInt($raw['footer_font_size'] ?? null, 8, 24, (int) $defaults['footer_font_size']),
            'footer_font_weight' => self::normalizeWeight($raw['footer_font_weight'] ?? null, (string) $defaults['footer_font_weight']),
            'footer_text_transform' => self::normalizeTextTransform($raw['footer_text_transform'] ?? null, (string) $defaults['footer_text_transform']),
            'footer_letter_spacing' => self::clampInt($raw['footer_letter_spacing'] ?? null, -2, 12, (int) $defaults['footer_letter_spacing']),
            'footer_font_style' => self::normalizeFontStyle($raw['footer_font_style'] ?? null, (string) $defaults['footer_font_style']),
            'footer_underline' => self::normalizeBool($raw['footer_underline'] ?? null, (bool) $defaults['footer_underline']),
            'footer_strikethrough' => self::normalizeBool($raw['footer_strikethrough'] ?? null, (bool) $defaults['footer_strikethrough']),
            'footer_line_height' => self::clampFloat($raw['footer_line_height'] ?? null, 1.0, 2.5, (float) $defaults['footer_line_height']),
            'body_font_family' => self::normalizeFontFamily($raw['body_font_family'] ?? null, (string) $defaults['body_font_family']),
            'body_font_size' => self::clampInt($raw['body_font_size'] ?? null, 8, 24, (int) $defaults['body_font_size']),
            'body_font_weight' => self::normalizeWeight($raw['body_font_weight'] ?? null, (string) $defaults['body_font_weight']),
            'body_color' => self::normalizeColor($raw['body_color'] ?? null, (string) $defaults['body_color']),
            'body_font_style' => self::normalizeFontStyle($raw['body_font_style'] ?? null, (string) $defaults['body_font_style']),
            'body_line_height' => self::clampFloat($raw['body_line_height'] ?? null, 1.0, 2.5, (float) $defaults['body_line_height']),
            'body_align' => self::normalizeAlign($raw['body_align'] ?? null, (string) $defaults['body_align']),
            'sign_block_position' => self::normalizeSignAlign($raw['sign_block_position'] ?? $raw['sign_image_align'] ?? $raw['sign_align'] ?? null, (string) $defaults['sign_block_position']),
            'sign_content_align' => self::normalizeSignAlign($raw['sign_content_align'] ?? $raw['sign_meta_align'] ?? $raw['sign_align'] ?? null, (string) $defaults['sign_content_align']),
            'sign_meta_layout' => self::normalizeSignMetaLayout($raw['sign_meta_layout'] ?? null, (string) $defaults['sign_meta_layout']),
            'sign_meta_order' => self::normalizeSignMetaOrder($raw['sign_meta_order'] ?? null, (string) $defaults['sign_meta_order']),
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

    private static function normalizeTextTransform(mixed $value, string $default): string
    {
        $allowed = ['none', 'uppercase', 'lowercase', 'capitalize'];
        $transform = strtolower(trim((string) ($value ?? '')));

        return in_array($transform, $allowed, true) ? $transform : $default;
    }

    private static function normalizeFontStyle(mixed $value, string $default): string
    {
        $allowed = ['normal', 'italic'];
        $style = strtolower(trim((string) ($value ?? '')));

        return in_array($style, $allowed, true) ? $style : $default;
    }

    public static function normalizePaperSize(mixed $value, string $default): string
    {
        $allowed = ['a4', 'letter', 'legal', 'a5', 'folio'];
        $size = strtolower(trim((string) ($value ?? '')));

        return in_array($size, $allowed, true) ? $size : $default;
    }

    public static function normalizePaperOrientation(mixed $value, string $default): string
    {
        $allowed = ['portrait', 'landscape'];
        $orientation = strtolower(trim((string) ($value ?? '')));

        return in_array($orientation, $allowed, true) ? $orientation : $default;
    }

    private static function normalizeFontFamily(mixed $value, string $default): string
    {
        $allowed = [
            'system-ui',
            'arial',
            'calibri',
            'times-new-roman',
            'georgia',
            'courier-new',
            'tahoma',
            'verdana',
            'segoe-ui',
        ];
        $key = strtolower(trim((string) ($value ?? '')));

        return in_array($key, $allowed, true) ? $key : $default;
    }

    private static function normalizeAlign(mixed $value, string $default): string
    {
        $align = strtolower(trim((string) ($value ?? '')));
        if (! in_array($align, ['left', 'center', 'right', 'justify'], true)) {
            return $default;
        }

        return $align;
    }

    private static function normalizeSignAlign(mixed $value, string $default): string
    {
        $align = strtolower(trim((string) ($value ?? '')));
        if (! in_array($align, ['left', 'center', 'right'], true)) {
            return $default;
        }

        return $align;
    }

    private static function normalizeSignMetaLayout(mixed $value, string $default): string
    {
        $layout = strtolower(trim((string) ($value ?? '')));
        if (! in_array($layout, ['inline', 'stack'], true)) {
            return $default;
        }

        return $layout;
    }

    private static function normalizeSignMetaOrder(mixed $value, string $default): string
    {
        $order = strtolower(trim((string) ($value ?? '')));
        if (! in_array($order, ['name_first', 'phone_first'], true)) {
            return $default;
        }

        return $order;
    }

    private static function normalizeBool(mixed $value, bool $default): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if ($value === 1 || $value === '1' || $value === 'true') {
            return true;
        }

        if ($value === 0 || $value === '0' || $value === 'false') {
            return false;
        }

        return $default;
    }

    private static function clampFloat(mixed $value, float $min, float $max, float $default): float
    {
        if ($value === null || $value === '') {
            return $default;
        }

        $n = (float) $value;

        return max($min, min($max, round($n, 2)));
    }
}
