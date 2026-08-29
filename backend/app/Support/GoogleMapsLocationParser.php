<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 15:11:03
 */

namespace App\Support;

class GoogleMapsLocationParser
{
    public static function normalize(string $input): string
    {
        $raw = trim($input);
        $raw = html_entity_decode($raw, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        if (preg_match('/<iframe[^>]+src\s*=\s*["\']([^"\']+)["\']/i', $raw, $matches)) {
            return self::decodeUrlValue($matches[1]);
        }

        // Iframe-ish paste without full tag, or src= alone.
        if (preg_match('/(?:^|[\s;])src\s*=\s*["\'](https?:\/\/[^"\']+)["\']/i', $raw, $matches)) {
            return self::decodeUrlValue($matches[1]);
        }

        if (preg_match('/https?:\/\/[^\s"\'<>]+/i', $raw, $matches)) {
            return self::decodeUrlValue($matches[0]);
        }

        return $raw;
    }

    public static function parse(?string $input): ?array
    {
        if ($input === null || trim($input) === '') {
            return null;
        }

        $normalized = self::normalize($input);

        $placePin = self::parsePlacePin($normalized);
        if ($placePin !== null) {
            return $placePin;
        }

        if (preg_match('/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/', $normalized, $matches)) {
            return self::asCoords((float) $matches[1], (float) $matches[2]);
        }

        if (preg_match('/[?&]q=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i', $normalized, $matches)) {
            return self::asCoords((float) $matches[1], (float) $matches[2]);
        }

        if (preg_match('/[?&](?:ll|center)=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i', $normalized, $matches)) {
            return self::asCoords((float) $matches[1], (float) $matches[2]);
        }

        // Embed camera center (!2d lng !3d lat) — reliable when place pin (!3d!4d) absent.
        if (preg_match('/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/', $normalized, $matches)) {
            $embedCoords = self::asCoords((float) $matches[2], (float) $matches[1]);
            if ($embedCoords !== null && (
                str_contains($normalized, '/maps/embed')
                || self::extractPlaceId($normalized) !== null
                || str_contains($normalized, 'output=embed')
            )) {
                return $embedCoords;
            }
        }

        // Camera center is unreliable when a place name is present (common in plain share links).
        if (self::extractPlaceName($normalized) !== null) {
            return null;
        }

        if (preg_match('/@(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/', $normalized, $matches)) {
            return self::asCoords((float) $matches[1], (float) $matches[2]);
        }

        if (preg_match('/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/', $normalized, $matches)) {
            return self::asCoords((float) $matches[2], (float) $matches[1]);
        }

        return null;
    }

    public static function extractPlaceName(string $input): ?string
    {
        $normalized = self::normalize($input);
        $candidates = [];

        // Plain string labels: !2sPlace+Name
        if (preg_match_all('/!2s([^!&\/?]+)/', $normalized, $matches)) {
            foreach ($matches[1] as $raw) {
                $name = self::decodeLabel($raw);
                if (self::isUsablePlaceLabel($name)) {
                    $candidates[] = $name;
                }
            }
        }

        // Base64 UTF-8 labels used heavily by Maps "Embed a map" dialog: !2z....
        if (preg_match_all('/!2z([A-Za-z0-9_\-=]+)/', $normalized, $matches)) {
            foreach ($matches[1] as $raw) {
                $name = self::decodeBase64Label($raw);
                if ($name !== null && self::isUsablePlaceLabel($name)) {
                    $candidates[] = $name;
                }
            }
        }

        if (preg_match('/\/maps\/place\/([^\/@]+)/i', $normalized, $matches)) {
            $name = self::decodeLabel($matches[1]);
            if (self::isUsablePlaceLabel($name)) {
                $candidates[] = $name;
            }
        }

        // Classic embed / share: ?q=Place+Name (not bare coords).
        if (preg_match('/[?&]q=([^&]+)/i', $normalized, $matches)) {
            $name = self::decodeLabel($matches[1]);
            if (self::isUsablePlaceLabel($name) && ! preg_match('/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?/', $name)) {
                $candidates[] = $name;
            }
        }

        // Embed API v1: /maps/embed/v1/place?q=Name
        if (preg_match('/\/maps\/embed\/v1\/place/i', $normalized) && preg_match('/[?&]q=([^&]+)/i', $normalized, $matches)) {
            $name = self::decodeLabel($matches[1]);
            if (self::isUsablePlaceLabel($name)) {
                $candidates[] = $name;
            }
        }

        if ($candidates === []) {
            return null;
        }

        // Prefer the longest meaningful label (skips short language tokens already).
        usort($candidates, static fn (string $a, string $b): int => mb_strlen($b) <=> mb_strlen($a));

        return $candidates[0];
    }

    /** Google feature id from Maps / embed (`!1s0x…:0x…`, including `%3A`). */
    public static function extractPlaceId(string $input): ?string
    {
        $normalized = self::normalize($input);

        if (! preg_match_all('/!1s(0x[0-9a-fA-F]+)(?::|%3A)(0x[0-9a-fA-F]+)/i', $normalized, $matches, PREG_SET_ORDER)) {
            if (preg_match('/[?&]cid=(\d+)/i', $normalized, $cid)) {
                return $cid[1];
            }

            return null;
        }

        for ($i = count($matches) - 1; $i >= 0; $i--) {
            $id = strtolower($matches[$i][1]).':'.strtolower($matches[$i][2]);
            if ($id !== '0x0:0x0') {
                return $id;
            }
        }

        return null;
    }

    /** Prefer a full /maps/place/Name/@… URL (strip tracking params). Reject empty/coord-only place paths. */
    public static function extractPlaceUrl(string $input): ?string
    {
        $normalized = self::normalize($input);
        if (! preg_match('#https?://(www\.)?google\.[^/]+/maps/place/[^?\s]+#i', $normalized, $matches)) {
            return null;
        }

        $url = $matches[0];
        if (self::isWeakPlaceUrl($url)) {
            return null;
        }

        $parts = parse_url($url);
        if (! is_array($parts) || empty($parts['scheme']) || empty($parts['host']) || empty($parts['path'])) {
            return $url;
        }

        $clean = $parts['scheme'].'://'.$parts['host'].$parts['path'];
        if (! empty($parts['query'])) {
            parse_str($parts['query'], $query);
            unset($query['entry'], $query['g_ep']);
            if ($query !== []) {
                $clean .= '?'.http_build_query($query);
            }
        }

        return self::isWeakPlaceUrl($clean) ? null : $clean;
    }

    /**
     * Canonical share URL from any Maps paste (place link, embed iframe, short-expanded URL).
     */
    public static function resolveShareUrl(string $input, ?float $lat = null, ?float $lng = null): ?string
    {
        $fromPlace = self::extractPlaceUrl($input);
        if ($fromPlace !== null) {
            return $fromPlace;
        }

        $coords = self::parse($input);
        $useLat = $lat ?? ($coords['lat'] ?? null);
        $useLng = $lng ?? ($coords['lng'] ?? null);
        if ($useLat === null || $useLng === null) {
            $placeId = self::extractPlaceId($input);
            $name = self::extractPlaceName($input);
            if ($placeId !== null) {
                $cidUrl = self::buildCidUrl($placeId);
                if ($cidUrl !== null) {
                    return $cidUrl;
                }
            }
            if ($name !== null) {
                return 'https://www.google.com/maps/search/?api=1&query='.rawurlencode($name);
            }

            return null;
        }

        return self::buildShareUrl(
            (float) $useLat,
            (float) $useLng,
            self::extractPlaceName($input),
            self::extractPlaceId($input),
        );
    }

    public static function buildShareUrl(float $lat, float $lng, ?string $name = null, ?string $placeId = null): string
    {
        $lat = round($lat, 7);
        $lng = round($lng, 7);
        $name = $name !== null ? trim($name) : '';
        $placeId = $placeId !== null ? trim($placeId) : '';

        // Hex feature id → cid URL is the most reliable way to keep the Google place title.
        if ($placeId !== '') {
            $cidUrl = self::buildCidUrl($placeId);
            if ($cidUrl !== null) {
                return $cidUrl;
            }
        }

        if ($name !== '') {
            $placePath = rawurlencode($name);
            $placePath = str_replace(['%20', '%28', '%29'], ['+', '(', ')'], $placePath);

            if ($placeId !== '') {
                return "https://www.google.com/maps/place/{$placePath}/@{$lat},{$lng},17z/data=!3m1!4b1!4m6!3m5!1s{$placeId}!8m2!3d{$lat}!4d{$lng}";
            }

            return 'https://www.google.com/maps/search/?api=1&query='.rawurlencode($name.' @ '.$lat.','.$lng);
        }

        // Never use /maps/place/{lat},{lng}/@… — Google rewrites it to /place//@…
        return 'https://www.google.com/maps?q='.rawurlencode($lat.','.$lng).'&z=17';
    }

    public static function buildCidUrl(string $placeId): ?string
    {
        $placeId = trim($placeId);
        if (preg_match('/^0x[0-9a-fA-F]+:(0x[0-9a-fA-F]+)$/', $placeId, $matches)) {
            $hex = substr($matches[1], 2);
            if ($hex === '' || strtolower($hex) === '0') {
                return null;
            }
            // Keep as decimal string (may exceed 32-bit).
            $cid = self::hexToDecimalString($hex);
            if ($cid === null || $cid === '0') {
                return null;
            }

            return 'https://www.google.com/maps?cid='.$cid;
        }

        if (preg_match('/^\d+$/', $placeId)) {
            return 'https://www.google.com/maps?cid='.$placeId;
        }

        return null;
    }

    /** True when URL would be rewritten by Google to /place//@coords. */
    public static function isWeakPlaceUrl(string $url): bool
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (! is_string($path)) {
            return true;
        }

        $path = rawurldecode($path);
        if (preg_match('#/maps/place/+@#i', $path)) {
            return true;
        }
        if (preg_match('#/maps/place/-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?/@#i', $path)) {
            return true;
        }

        return false;
    }

    private static function hexToDecimalString(string $hex): ?string
    {
        $hex = strtolower(ltrim($hex, '0'));
        if ($hex === '') {
            return '0';
        }
        if (! ctype_xdigit($hex)) {
            return null;
        }

        if (function_exists('gmp_init')) {
            return gmp_strval(gmp_init($hex, 16), 10);
        }

        if (function_exists('bcmul') && function_exists('bcadd')) {
            $dec = '0';
            $len = strlen($hex);
            for ($i = 0; $i < $len; $i++) {
                $dec = bcmul($dec, '16', 0);
                $dec = bcadd($dec, (string) hexdec($hex[$i]), 0);
            }

            return $dec;
        }

        // Pure decimal-string math (no BCMath/GMP required).
        $dec = '0';
        $map = ['0' => 0, '1' => 1, '2' => 2, '3' => 3, '4' => 4, '5' => 5, '6' => 6, '7' => 7, '8' => 8, '9' => 9, 'a' => 10, 'b' => 11, 'c' => 12, 'd' => 13, 'e' => 14, 'f' => 15];
        $len = strlen($hex);
        for ($i = 0; $i < $len; $i++) {
            $dec = self::decimalMul16($dec);
            $dec = self::decimalAddSmall($dec, $map[$hex[$i]]);
        }

        return $dec;
    }

    private static function decimalMul16(string $dec): string
    {
        $carry = 0;
        $out = '';
        for ($i = strlen($dec) - 1; $i >= 0; $i--) {
            $n = ((int) $dec[$i]) * 16 + $carry;
            $out = ($n % 10).$out;
            $carry = intdiv($n, 10);
        }
        while ($carry > 0) {
            $out = ($carry % 10).$out;
            $carry = intdiv($carry, 10);
        }

        return ltrim($out, '0') === '' ? '0' : ltrim($out, '0');
    }

    private static function decimalAddSmall(string $dec, int $add): string
    {
        $carry = $add;
        $out = '';
        for ($i = strlen($dec) - 1; $i >= 0; $i--) {
            $n = ((int) $dec[$i]) + $carry;
            $out = ($n % 10).$out;
            $carry = intdiv($n, 10);
        }
        while ($carry > 0) {
            $out = ($carry % 10).$out;
            $carry = intdiv($carry, 10);
        }

        return ltrim($out, '0') === '' ? '0' : ltrim($out, '0');
    }

    public static function isShortMapsUrl(string $input): bool
    {
        return (bool) preg_match('/^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/)/i', trim($input));
    }

    public static function isGoogleMapsUrl(string $input): bool
    {
        return (bool) preg_match('/google\.com\/maps|maps\.google|maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\//i', $input);
    }

    public static function looksLikeAddress(string $input): bool
    {
        $value = trim($input);
        if ($value === '' || preg_match('/^https?:\/\//i', $value)) {
            return false;
        }

        if (preg_match('/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/', $value)) {
            return false;
        }

        return (bool) preg_match('/[a-zA-Z]/', $value) && mb_strlen($value) >= 8;
    }

    private static function parsePlacePin(string $normalized): ?array
    {
        if (! preg_match_all('/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/', $normalized, $matches, PREG_SET_ORDER)) {
            return null;
        }

        $last = $matches[array_key_last($matches)];

        return self::asCoords((float) $last[1], (float) $last[2]);
    }

    private static function asCoords(float $lat, float $lng): ?array
    {
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            return null;
        }

        return [
            'lat' => round($lat, 7),
            'lng' => round($lng, 7),
        ];
    }

    private static function decodeUrlValue(string $value): string
    {
        $value = trim($value);
        $decoded = rawurldecode($value);
        // Second pass for double-encoded embed pb params (%253A → %3A → :).
        if (str_contains($decoded, '%')) {
            $decoded = rawurldecode($decoded);
        }

        return $decoded;
    }

    private static function decodeLabel(string $value): string
    {
        $value = str_replace('+', ' ', $value);
        $value = rawurldecode($value);
        if (str_contains($value, '%')) {
            $value = rawurldecode($value);
        }

        return trim(html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    }

    private static function decodeBase64Label(string $value): ?string
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }

        $padded = strtr($value, '-_', '+/');
        $padLen = strlen($padded) % 4;
        if ($padLen > 0) {
            $padded .= str_repeat('=', 4 - $padLen);
        }

        $decoded = base64_decode($padded, true);
        if ($decoded === false || $decoded === '') {
            return null;
        }

        if (! mb_check_encoding($decoded, 'UTF-8')) {
            $decoded = mb_convert_encoding($decoded, 'UTF-8', 'UTF-8, ISO-8859-1');
        }

        return trim(html_entity_decode($decoded, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    }

    private static function isUsablePlaceLabel(string $name): bool
    {
        if (mb_strlen($name) < 2) {
            return false;
        }

        if (preg_match('/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/', $name)) {
            return false;
        }

        // Skip bare camera/zoom fragments sometimes appearing as !2s values.
        if (preg_match('/^-?\d+(\.\d+)?$/', $name)) {
            return false;
        }

        // Embed tails often end with !2sen / !2sid (UI language), not place names.
        if (preg_match('/^[a-z]{2,3}$/i', $name)) {
            return false;
        }

        return (bool) preg_match('/[\p{L}\p{N}]/u', $name);
    }
}
