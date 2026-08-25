<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 14:50:00
 */

namespace App\Support;

class GoogleMapsLocationParser
{
    public static function normalize(string $input): string
    {
        $raw = trim($input);
        $raw = html_entity_decode($raw, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        if (preg_match('/<iframe[^>]+src=["\']([^"\']+)["\']/i', $raw, $matches)) {
            return urldecode($matches[1]);
        }

        if (preg_match('/https?:\/\/[^\s"\'<>]+/i', $raw, $matches)) {
            return $matches[0];
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

        // Camera center is unreliable when a place name is present (common in embed iframe).
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

        if (preg_match('/!2s([^!&\/?]+)/', $normalized, $matches)) {
            $name = trim(urldecode(str_replace('+', ' ', $matches[1])));
            if (mb_strlen($name) >= 2) {
                return $name;
            }
        }

        if (preg_match('/\/maps\/place\/([^\/@]+)/i', $normalized, $matches)) {
            $name = trim(urldecode(str_replace('+', ' ', $matches[1])));
            if ($name !== '' && ! preg_match('/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/', $name) && mb_strlen($name) >= 2) {
                return $name;
            }
        }

        return null;
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
}
