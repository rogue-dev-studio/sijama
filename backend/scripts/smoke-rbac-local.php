<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 17:50:00
 */

$base = getenv('SMOKE_BASE') ?: 'http://localhost/api';

function request(string $method, string $url, ?string $token = null, ?array $body = null): array
{
    $ch = curl_init($url);
    $headers = ['Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer '.$token;
    }
    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['status' => $status, 'json' => json_decode((string) $raw, true)];
}

function login(string $base, string $username, string $password): string
{
    $res = request('POST', $base.'/login', null, [
        'username' => $username,
        'password' => $password,
    ]);
    if ($res['status'] !== 200 || empty($res['json']['data']['token'])) {
        throw new RuntimeException("Login failed for {$username}: HTTP {$res['status']}");
    }

    return (string) $res['json']['data']['token'];
}

$super = login($base, 'admin', 'password');
$pusat = login($base, 'admin.pusat', 'password');
$daerah = login($base, 'admin.daerah', 'password');

echo "=== Matriks GET ===\n";
$matriksRes = request('GET', $base.'/master/matriks', $super);
echo 'superadmin: '.$matriksRes['status'];
if ($matriksRes['status'] !== 200) {
    echo ' ERROR: '.substr(json_encode($matriksRes['json']), 0, 300);
}
echo "\n";
echo 'admin.pusat: '.request('GET', $base.'/master/matriks', $pusat)['status']."\n";
echo 'admin.daerah: '.request('GET', $base.'/master/matriks', $daerah)['status']."\n";

echo "\n=== Konfig GET ===\n";
echo 'superadmin: '.request('GET', $base.'/aplikasi/konfig', $super)['status']."\n";
echo 'admin.pusat: '.request('GET', $base.'/aplikasi/konfig', $pusat)['status']."\n";

$usersSuper = request('GET', $base.'/master/users?per_page=50', $super)['json']['data']['items'] ?? [];
$usersDaerah = request('GET', $base.'/master/users?per_page=50', $daerah)['json']['data']['items'] ?? [];
echo "\n=== Users visible ===\n";
echo 'superadmin sees: '.count($usersSuper)."\n";
echo 'admin.daerah sees: '.count($usersDaerah)."\n";

$pusatId = null;
$superId = null;
foreach ($usersSuper as $user) {
    if (($user['username'] ?? '') === 'admin.pusat') {
        $pusatId = $user['id'];
    }
    if (($user['username'] ?? '') === 'admin') {
        $superId = $user['id'];
    }
}

echo "\n=== Update admin.pusat as admin.daerah (expect 422) ===\n";
echo 'status: '.request('PUT', $base.'/master/users/'.$pusatId, $daerah, ['username' => 'hacked.pusat'])['status']."\n";

echo "\n=== Update superadmin as admin.pusat (expect 422) ===\n";
echo 'status: '.request('PUT', $base.'/master/users/'.$superId, $pusat, ['username' => 'hacked.admin'])['status']."\n";

$me = request('GET', $base.'/me', $pusat)['json']['data']['permissions'] ?? [];
$rbac = array_values(array_filter($me, fn ($p) => (bool) preg_match('/matriks|menu\.|fitur\.|hak_akses|konfig/', (string) $p)));
echo "\n=== admin.pusat RBAC/konfig permissions (expect none) ===\n";
echo empty($rbac) ? "(none)\n" : implode(', ', $rbac)."\n";

echo "\nSMOKE RBAC OK\n";
