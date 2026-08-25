<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 16:15:00
 */

namespace App\Services;

use App\Models\Lokasi;
use App\Support\GoogleMapsLocationParser;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MapsLocationResolverService
{
    public function resolve(string $input): array
    {
        $normalized = GoogleMapsLocationParser::normalize($input);

        $coords = GoogleMapsLocationParser::parse($normalized);
        if ($coords !== null) {
            return [
                ...$coords,
                'resolved_via' => 'parse',
            ];
        }

        $placeName = GoogleMapsLocationParser::extractPlaceName($normalized);
        if ($placeName !== null) {
            $geocoded = $this->geocodeAddress($placeName);
            if ($geocoded !== null) {
                return [
                    ...$geocoded,
                    'resolved_via' => 'place_name',
                    'place_name' => $placeName,
                ];
            }
        }

        if (
            GoogleMapsLocationParser::isShortMapsUrl($normalized)
            || GoogleMapsLocationParser::isGoogleMapsUrl($normalized)
        ) {
            $expanded = $this->expandUrl($normalized);
            if ($expanded !== null) {
                $coords = GoogleMapsLocationParser::parse($expanded);
                if ($coords !== null) {
                    return [
                        ...$coords,
                        'resolved_via' => 'redirect',
                        'source_url' => $expanded,
                    ];
                }

                $expandedPlace = GoogleMapsLocationParser::extractPlaceName($expanded);
                if ($expandedPlace !== null) {
                    $geocoded = $this->geocodeAddress($expandedPlace);
                    if ($geocoded !== null) {
                        return [
                            ...$geocoded,
                            'resolved_via' => 'place_name',
                            'place_name' => $expandedPlace,
                            'source_url' => $expanded,
                        ];
                    }
                }
            }
        }

        if (GoogleMapsLocationParser::looksLikeAddress($normalized)) {
            $coords = $this->geocodeAddress($normalized);
            if ($coords !== null) {
                return [
                    ...$coords,
                    'resolved_via' => 'geocode',
                ];
            }
        }

        throw new RuntimeException(
            'Tidak dapat menemukan koordinat. Pastikan input berisi tautan Google Maps, iframe embed, koordinat, atau alamat lengkap.',
        );
    }

    /**
     * @return list<array{name: string, display_name: string, lat: float, lng: float, source?: string}>
     */
    public function searchPlaces(string $query, int $limit = 6): array
    {
        $query = trim($query);
        if ($query === '') {
            return [];
        }

        $limit = max(1, min(10, $limit));
        $results = [];

        $results = $this->mergeUnique($results, $this->searchLocalLokasi($query, $limit));

        $googleKey = $this->googleMapsApiKey();
        if ($googleKey !== null && count($results) < $limit) {
            $results = $this->mergeUnique(
                $results,
                $this->searchGooglePlaces($query, $limit - count($results), $googleKey),
            );
        }

        $remoteError = null;
        if (count($results) < $limit) {
            foreach ($this->queryVariants($query) as $variant) {
                if (count($results) >= $limit) {
                    break;
                }
                try {
                    $results = $this->mergeUnique(
                        $results,
                        $this->searchNominatim($variant, $limit - count($results)),
                    );
                } catch (RuntimeException $exception) {
                    $remoteError = $exception;
                }
            }
        }

        if (count($results) < $limit) {
            try {
                $results = $this->mergeUnique(
                    $results,
                    $this->searchPhoton($query, $limit - count($results)),
                );
            } catch (RuntimeException $exception) {
                $remoteError ??= $exception;
            }
        }

        if ($results === [] && $remoteError !== null) {
            throw $remoteError;
        }

        return array_slice($results, 0, $limit);
    }

    /**
     * @return list<string>
     */
    private function queryVariants(string $query): array
    {
        $variants = [];
        $push = function (string $value) use (&$variants): void {
            $value = trim(preg_replace('/\s+/u', ' ', $value) ?? $value);
            if ($value === '' || in_array($value, $variants, true)) {
                return;
            }
            $variants[] = $value;
        };

        $push($query);

        $withoutParens = trim(preg_replace('/\([^)]*\)/u', ' ', $query) ?? $query);
        $push($withoutParens);

        $withoutOrg = trim(preg_replace(
            '/\b(ldii|dpp|dpw|dpd|ppm|gsg)\b/iu',
            ' ',
            $withoutParens,
        ) ?? $withoutParens);
        $push($withoutOrg);

        $withoutQuotes = trim(preg_replace('/[\"“”\'`]/u', ' ', $withoutOrg) ?? $withoutOrg);
        $push($withoutQuotes);

        if (! preg_match('/\bindonesia\b/iu', $withoutQuotes)) {
            $push($withoutQuotes.' Indonesia');
        }

        return $variants;
    }

    /**
     * @return list<array{name: string, display_name: string, lat: float, lng: float, source: string}>
     */
    private function searchLocalLokasi(string $query, int $limit): array
    {
        if ($limit < 1) {
            return [];
        }

        $needle = mb_strtolower(trim(preg_replace('/\([^)]*\)/u', ' ', $query) ?? $query));
        $needle = trim(preg_replace('/\b(ldii|dpp|dpw|dpd)\b/iu', ' ', $needle) ?? $needle);
        $needle = trim(preg_replace('/\s+/u', ' ', $needle) ?? $needle);
        if ($needle === '') {
            return [];
        }

        $tokens = array_values(array_filter(
            preg_split('/\s+/u', $needle) ?: [],
            fn (string $token) => mb_strlen($token) >= 3,
        ));

        $builder = Lokasi::query()
            ->whereNotNull('lat')
            ->whereNotNull('lng')
            ->where('is_active', true)
            ->orderBy('nama')
            ->limit($limit);

        $builder->where(function ($queryBuilder) use ($needle, $tokens): void {
            $queryBuilder->where('nama', 'ilike', "%{$needle}%");
            foreach ($tokens as $token) {
                $queryBuilder->orWhere('nama', 'ilike', "%{$token}%");
            }
        });

        $results = [];
        foreach ($builder->get(['nama', 'kota', 'alamat', 'lat', 'lng', 'jenis']) as $item) {
            $lat = $item->lat !== null ? (float) $item->lat : null;
            $lng = $item->lng !== null ? (float) $item->lng : null;
            if ($lat === null || $lng === null) {
                continue;
            }
            $parts = array_values(array_filter([
                (string) $item->nama,
                $item->jenis ? strtoupper((string) $item->jenis) : null,
                $item->kota,
                $item->alamat,
            ]));
            $results[] = [
                'name' => (string) $item->nama,
                'display_name' => implode(' · ', $parts).' (data SIJAMA)',
                'lat' => round($lat, 7),
                'lng' => round($lng, 7),
                'source' => 'local',
            ];
        }

        return $results;
    }

    /**
     * @return list<array{name: string, display_name: string, lat: float, lng: float, source: string}>
     */
    private function searchNominatim(string $query, int $limit): array
    {
        if ($limit < 1) {
            return [];
        }

        try {
            $response = Http::timeout(15)
                ->withHeaders($this->httpHeaders())
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $query,
                    'format' => 'jsonv2',
                    'addressdetails' => 0,
                    'limit' => $limit,
                    'countrycodes' => 'id',
                ]);

            if (! $response->successful()) {
                throw new RuntimeException(
                    'Layanan pencarian tempat sedang tidak tersedia (HTTP '.$response->status().'). Coba lagi sebentar.',
                );
            }

            $items = $response->json();
            if (! is_array($items)) {
                return [];
            }

            $results = [];
            foreach ($items as $item) {
                if (! is_array($item)) {
                    continue;
                }
                $mapped = $this->mapLatLonItem($item, 'nominatim');
                if ($mapped !== null) {
                    $results[] = $mapped;
                }
            }

            return $results;
        } catch (RuntimeException $exception) {
            throw $exception;
        } catch (\Throwable $exception) {
            throw new RuntimeException(
                'Gagal menghubungi layanan pencarian tempat. Periksa koneksi server lalu coba lagi.',
                0,
                $exception,
            );
        }
    }

    /**
     * @return list<array{name: string, display_name: string, lat: float, lng: float, source: string}>
     */
    private function searchPhoton(string $query, int $limit): array
    {
        if ($limit < 1) {
            return [];
        }

        foreach ($this->queryVariants($query) as $variant) {
            try {
                $response = Http::timeout(15)
                    ->withHeaders($this->httpHeaders())
                    ->get('https://photon.komoot.io/api/', [
                        'q' => $variant,
                        'limit' => $limit,
                        'lang' => 'en',
                    ]);

                if (! $response->successful()) {
                    continue;
                }

                $payload = $response->json();
                $features = is_array($payload) ? ($payload['features'] ?? null) : null;
                if (! is_array($features)) {
                    continue;
                }

                $results = [];
                foreach ($features as $feature) {
                    if (! is_array($feature)) {
                        continue;
                    }
                    $geometry = $feature['geometry'] ?? null;
                    $properties = $feature['properties'] ?? null;
                    if (! is_array($geometry) || ! is_array($properties)) {
                        continue;
                    }
                    $coordinates = $geometry['coordinates'] ?? null;
                    if (! is_array($coordinates) || count($coordinates) < 2) {
                        continue;
                    }
                    $lng = (float) $coordinates[0];
                    $lat = (float) $coordinates[1];
                    $country = strtoupper((string) ($properties['countrycode'] ?? ''));
                    if ($country !== '' && $country !== 'ID') {
                        continue;
                    }
                    $name = (string) ($properties['name'] ?? '');
                    $parts = array_values(array_filter([
                        $name,
                        $properties['street'] ?? null,
                        $properties['district'] ?? null,
                        $properties['city'] ?? null,
                        $properties['state'] ?? null,
                        $properties['country'] ?? null,
                    ], fn ($part) => is_string($part) && trim($part) !== ''));
                    $display = implode(', ', $parts);
                    if ($name === '' && $display === '') {
                        continue;
                    }
                    $results[] = [
                        'name' => $name !== '' ? $name : $display,
                        'display_name' => $display !== '' ? $display : $name,
                        'lat' => round($lat, 7),
                        'lng' => round($lng, 7),
                        'source' => 'photon',
                    ];
                    if (count($results) >= $limit) {
                        break;
                    }
                }

                if ($results !== []) {
                    return $results;
                }
            } catch (\Throwable) {
                continue;
            }
        }

        return [];
    }

    /**
     * @return list<array{name: string, display_name: string, lat: float, lng: float, source: string}>
     */
    private function searchGooglePlaces(string $query, int $limit, string $apiKey): array
    {
        if ($limit < 1) {
            return [];
        }

        try {
            $response = Http::timeout(15)
                ->get('https://maps.googleapis.com/maps/api/place/textsearch/json', [
                    'query' => $query,
                    'region' => 'id',
                    'language' => 'id',
                    'key' => $apiKey,
                ]);

            if (! $response->successful()) {
                return [];
            }

            $payload = $response->json();
            if (! is_array($payload) || ($payload['status'] ?? '') !== 'OK') {
                return [];
            }

            $items = $payload['results'] ?? [];
            if (! is_array($items)) {
                return [];
            }

            $results = [];
            foreach ($items as $item) {
                if (! is_array($item) || count($results) >= $limit) {
                    break;
                }
                $location = $item['geometry']['location'] ?? null;
                if (! is_array($location)) {
                    continue;
                }
                $lat = isset($location['lat']) ? (float) $location['lat'] : null;
                $lng = isset($location['lng']) ? (float) $location['lng'] : null;
                if ($lat === null || $lng === null) {
                    continue;
                }
                $name = (string) ($item['name'] ?? '');
                $address = (string) ($item['formatted_address'] ?? '');
                $results[] = [
                    'name' => $name !== '' ? $name : $address,
                    'display_name' => $address !== '' ? $address : $name,
                    'lat' => round($lat, 7),
                    'lng' => round($lng, 7),
                    'source' => 'google',
                ];
            }

            return $results;
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array{name: string, display_name: string, lat: float, lng: float, source: string}|null
     */
    private function mapLatLonItem(array $item, string $source): ?array
    {
        $lat = isset($item['lat']) ? (float) $item['lat'] : null;
        $lng = isset($item['lon']) ? (float) $item['lon'] : null;
        if ($lat === null || $lng === null) {
            return null;
        }
        $display = (string) ($item['display_name'] ?? '');
        $name = (string) ($item['name'] ?? '');
        if ($name === '' && $display !== '') {
            $name = explode(',', $display)[0] ?? $display;
        }
        if ($name === '' && $display === '') {
            return null;
        }

        return [
            'name' => $name !== '' ? $name : $display,
            'display_name' => $display !== '' ? $display : $name,
            'lat' => round($lat, 7),
            'lng' => round($lng, 7),
            'source' => $source,
        ];
    }

    /**
     * @param  list<array{name: string, display_name: string, lat: float, lng: float, source?: string}>  $existing
     * @param  list<array{name: string, display_name: string, lat: float, lng: float, source?: string}>  $incoming
     * @return list<array{name: string, display_name: string, lat: float, lng: float, source?: string}>
     */
    private function mergeUnique(array $existing, array $incoming): array
    {
        foreach ($incoming as $item) {
            $duplicate = false;
            foreach ($existing as $known) {
                if (
                    abs($known['lat'] - $item['lat']) < 0.00008
                    && abs($known['lng'] - $item['lng']) < 0.00008
                ) {
                    $duplicate = true;
                    break;
                }
            }
            if (! $duplicate) {
                $existing[] = $item;
            }
        }

        return $existing;
    }

    /**
     * @return array<string, string>
     */
    private function httpHeaders(): array
    {
        return [
            'User-Agent' => config('app.name', 'SIJAMA').'/1.0 (lokasi-search; contact=dev@localhost)',
            'Accept' => 'application/json',
            'Accept-Language' => 'id,en',
        ];
    }

    private function googleMapsApiKey(): ?string
    {
        $key = trim((string) env('GOOGLE_MAPS_API_KEY', ''));

        return $key !== '' ? $key : null;
    }

    private function expandUrl(string $url): ?string
    {
        if (! preg_match('/^https?:\/\//i', $url)) {
            $url = 'https://'.$url;
        }

        try {
            $response = Http::timeout(12)
                ->withOptions(['allow_redirects' => ['max' => 8, 'track_redirects' => true]])
                ->withHeaders([
                    'User-Agent' => config('app.name', 'SIJAMA').' MapsLocationResolver',
                ])
                ->get($url);

            if (! $response->successful() && ! $response->redirect()) {
                return null;
            }

            return (string) $response->effectiveUri();
        } catch (\Throwable) {
            return null;
        }
    }

    private function geocodeAddress(string $address): ?array
    {
        $items = $this->searchPlaces($address, 1);
        if ($items === []) {
            return null;
        }

        return [
            'lat' => $items[0]['lat'],
            'lng' => $items[0]['lng'],
        ];
    }
}
