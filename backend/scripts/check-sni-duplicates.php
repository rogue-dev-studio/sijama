<?php

declare(strict_types=1);

$rows = array_slice(array_map('str_getcsv', file(__DIR__.'/../database/data/wilayah/sni_regencies.csv')), 1);
$counts = [];
foreach ($rows as $row) {
    $counts[$row[1]] = ($counts[$row[1]] ?? 0) + 1;
}
$dup = array_filter($counts, static fn (int $count): bool => $count > 1);
echo count($dup)." duplicate singkatan\n";
foreach ($dup as $code => $count) {
    echo "{$code}: {$count}\n";
}
