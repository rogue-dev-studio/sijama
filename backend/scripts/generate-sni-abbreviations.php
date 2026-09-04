<?php

declare(strict_types=1);

/**
 * Generate SNI 7657:2010 abbreviation CSV for wilayah administrasi seed.
 *
 * Usage: php scripts/generate-sni-abbreviations.php
 *
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 12:20:00
 */

$base = dirname(__DIR__).'/database/data/wilayah';
$ichadhrKabkotUrl = 'https://raw.githubusercontent.com/ichadhr/db-wilayah-indonesia/master/csv/tbl_kabkot.csv';

$provinceSni = [
    '11' => 'ID-AC',
    '12' => 'ID-SU',
    '13' => 'ID-SB',
    '14' => 'ID-RI',
    '15' => 'ID-JA',
    '16' => 'ID-SS',
    '17' => 'ID-BE',
    '18' => 'ID-LA',
    '19' => 'ID-BB',
    '21' => 'ID-KR',
    '31' => 'ID-JK',
    '32' => 'ID-JB',
    '33' => 'ID-JT',
    '34' => 'ID-YO',
    '35' => 'ID-JI',
    '36' => 'ID-BT',
    '51' => 'ID-BA',
    '52' => 'ID-NB',
    '53' => 'ID-NT',
    '61' => 'ID-KB',
    '62' => 'ID-KT',
    '63' => 'ID-KS',
    '64' => 'ID-KI',
    '65' => 'ID-KU',
    '71' => 'ID-SA',
    '72' => 'ID-ST',
    '73' => 'ID-SN',
    '74' => 'ID-SG',
    '75' => 'ID-GO',
    '76' => 'ID-SR',
    '81' => 'ID-MA',
    '82' => 'ID-MU',
    '91' => 'ID-PA',
    '92' => 'ID-PB',
    '93' => 'ID-PS',
    '94' => 'ID-PT',
    '95' => 'ID-PG',
    '96' => 'ID-PD',
];

$manualRegencySni = [
    '3171' => 'TNA',
    '3172' => 'TJP',
    '3173' => 'GGP',
    '3174' => 'KYB',
    '3175' => 'CKG',
    '3101' => 'KSU',
    '3273' => 'BDG',
    '1371' => 'PAD',
    '1277' => 'PSP',
    '6271' => 'PLK',
    '7271' => 'PAL',
    '9601' => 'AMS',
    '9671' => 'SON',
];

$metroByCode = [
    '3101' => 'Jabodetabek',
    '3171' => 'Jabodetabek',
    '3172' => 'Jabodetabek',
    '3173' => 'Jabodetabek',
    '3174' => 'Jabodetabek',
    '3175' => 'Jabodetabek',
    '3201' => 'Jabodetabek',
    '3203' => 'Jabodetabekpunjur',
    '3216' => 'Jabodetabek',
    '3271' => 'Jabodetabek',
    '3275' => 'Jabodetabek',
    '3276' => 'Jabodetabek',
    '3603' => 'Jabodetabek',
    '3671' => 'Jabodetabek',
    '3674' => 'Jabodetabek',
    '3204' => 'Bandung Raya',
    '3217' => 'Bandung Raya',
    '3273' => 'Bandung Raya',
    '3277' => 'Bandung Raya',
    '3509' => 'Gerbangkertosusila',
    '3510' => 'Gerbangkertosusila',
    '3512' => 'Gerbangkertosusila',
    '3514' => 'Gerbangkertosusila',
    '3576' => 'Gerbangkertosusila',
    '3578' => 'Gerbangkertosusila',
    '3322' => 'Sarbini',
    '3371' => 'Sarbini',
    '3373' => 'Sarbini',
    '3375' => 'Sarbini',
    '3376' => 'Sarbini',
    '5103' => 'Sarbagita',
    '5104' => 'Sarbagita',
    '5106' => 'Sarbagita',
    '5171' => 'Sarbagita',
    '7303' => 'Mamminasata',
    '7305' => 'Mamminasata',
    '7306' => 'Mamminasata',
    '7308' => 'Mamminasata',
    '7371' => 'Mamminasata',
    '1207' => 'Mebidangro',
    '1271' => 'Mebidangro',
    '1272' => 'Mebidangro',
    '1275' => 'Mebidangro',
    '1276' => 'Mebidangro',
    '1277' => 'Mebidangro',
    '1278' => 'Mebidangro',
];

$ichadhrProvinceToCode = [
    1 => '11', 2 => '12', 3 => '13', 4 => '14', 5 => '15', 6 => '16', 7 => '17', 8 => '18',
    9 => '19', 10 => '21', 11 => '31', 12 => '32', 13 => '33', 14 => '34', 15 => '35', 16 => '36',
    17 => '51', 18 => '52', 19 => '53', 20 => '61', 21 => '62', 22 => '63', 23 => '64', 24 => '65',
    25 => '71', 26 => '72', 27 => '73', 28 => '74', 29 => '75', 30 => '76', 31 => '81', 32 => '82',
    33 => '91', 34 => '92',
];

function normalizeRegencyName(string $name): string
{
    $name = strtolower(trim($name));
    $name = preg_replace('/\bkotamadya daerah\b/u', '', $name) ?? $name;
    $name = preg_replace('/\bkota administrasi\b/u', 'kota', $name) ?? $name;
    $name = preg_replace('/\bkota adm\.?\b/u', 'kota', $name) ?? $name;
    $name = preg_replace('/\bkabupaten administrasi\b/u', 'kabupaten', $name) ?? $name;
    $name = preg_replace('/\bkabupaten adm\.?\b/u', 'kabupaten', $name) ?? $name;
    $name = preg_replace('/[^a-z0-9\s]/u', ' ', $name) ?? $name;
    $name = preg_replace('/\s+/u', ' ', $name) ?? $name;

    return trim($name);
}

function readCsv(string $path): array
{
    $handle = fopen($path, 'rb');
    if ($handle === false) {
        throw new RuntimeException("Cannot open {$path}");
    }

    $rows = [];
    try {
        $header = fgetcsv($handle);
        if ($header === false) {
            return [];
        }
        $header = array_map(static fn ($value) => trim((string) $value), $header);
        while (($row = fgetcsv($handle)) !== false) {
            if ($row === [null] || $row === false) {
                continue;
            }
            $assoc = [];
            foreach ($header as $index => $key) {
                $assoc[$key] = isset($row[$index]) ? (string) $row[$index] : '';
            }
            $rows[] = $assoc;
        }
    } finally {
        fclose($handle);
    }

    return $rows;
}

function writeCsv(string $path, array $header, array $rows): void
{
    $handle = fopen($path, 'wb');
    if ($handle === false) {
        throw new RuntimeException("Cannot write {$path}");
    }

    try {
        fputcsv($handle, $header);
        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }
    } finally {
        fclose($handle);
    }
}

function fallbackSingkatan(string $name): string
{
    $normalized = normalizeRegencyName($name);
    $normalized = preg_replace('/^(kabupaten|kota)\s+/u', '', $normalized) ?? $normalized;
    $parts = preg_split('/\s+/u', $normalized) ?: [];
    $letters = '';
    foreach ($parts as $part) {
        if ($part === '') {
            continue;
        }
        $letters .= strtoupper($part[0]);
        if (strlen($letters) >= 3) {
            break;
        }
    }
    if (strlen($letters) < 3) {
        $compact = strtoupper(preg_replace('/[^a-z]/u', '', $normalized) ?? '');
        $letters = str_pad(substr($compact, 0, 3), 3, 'X');
    }

    return substr($letters, 0, 3);
}

$ichadhrCsv = file_get_contents($ichadhrKabkotUrl);
if ($ichadhrCsv === false) {
    throw new RuntimeException('Cannot download ichadhr kabkot CSV');
}

$tmp = tempnam(sys_get_temp_dir(), 'kabkot');
file_put_contents($tmp, $ichadhrCsv);
$ichadhrRows = readCsv($tmp);
unlink($tmp);

$lookup = [];
foreach ($ichadhrRows as $row) {
    $provinceId = (int) ($row['provinsi_id'] ?? 0);
    if (! isset($ichadhrProvinceToCode[$provinceId])) {
        continue;
    }
    $provinceCode = $ichadhrProvinceToCode[$provinceId];
    $key = $provinceCode.'|'.normalizeRegencyName((string) ($row['kabupaten_kota'] ?? ''));
    $lookup[$key] = strtoupper(trim((string) ($row['k_bsni'] ?? '')));
}

$regencies = readCsv($base.'/regencies.csv');
$regencyRows = [];
$unmatched = [];

foreach ($regencies as $row) {
    $code = (string) $row['code'];
    $provinceCode = (string) $row['province_code'];
    $name = (string) $row['name'];
    $key = $provinceCode.'|'.normalizeRegencyName($name);

    $singkatan = $manualRegencySni[$code] ?? ($lookup[$key] ?? '');
    if ($singkatan === '') {
        $singkatan = fallbackSingkatan($name);
        $unmatched[] = $code.' '.$name.' -> '.$singkatan;
    }

    $regencyRows[] = [
        $code,
        $singkatan,
        $metroByCode[$code] ?? '',
    ];
}

$provinceRows = [];
foreach (readCsv($base.'/provinces.csv') as $row) {
    $code = (string) $row['code'];
    $provinceRows[] = [
        $code,
        $provinceSni[$code] ?? ('ID-'.strtoupper(substr(preg_replace('/\s+/u', '', (string) $row['name']) ?? 'XX', 0, 2))),
    ];
}

writeCsv($base.'/sni_provinces.csv', ['code', 'singkatan'], $provinceRows);
writeCsv($base.'/sni_regencies.csv', ['code', 'singkatan', 'singkatan_kawasan_metropolitan'], $regencyRows);

file_put_contents($base.'/sni_regencies.unmatched.log', implode(PHP_EOL, $unmatched).PHP_EOL);

echo 'Generated '.count($provinceRows).' province and '.count($regencyRows)." regency SNI rows\n";
echo 'Unmatched (fallback used): '.count($unmatched)."\n";
