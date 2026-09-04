# Wilayah naming rename v1.1.0 - bulk replacements
$root = Split-Path -Parent $PSScriptRoot
$extensions = @('*.php', '*.sql', '*.md')
$files = Get-ChildItem -Path $root -Recurse -Include $extensions -File |
    Where-Object { $_.FullName -notmatch '\\vendor\\|\\node_modules\\|\\storage\\' }

function Apply-Replacements([string]$content, [hashtable[]]$pairs) {
    foreach ($pair in $pairs) {
        $content = $content.Replace($pair.Key, $pair.Value)
    }
    return $content
}

# Order matters: longest / most specific first
$fkPairs = @(
    @{ Key = 'adm_desa_kelurahan_id'; Value = 'wilayah_adm_desa_id' }
    @{ Key = 'desa_kelurahan_id'; Value = 'wilayah_adm_desa_id' }
    @{ Key = 'kabupaten_kota_id'; Value = 'wilayah_adm_kabupaten_kota_id' }
    @{ Key = 'negara_id'; Value = 'wilayah_adm_negara_id' }
    @{ Key = 'provinsi_id'; Value = 'wilayah_adm_provinsi_id' }
    @{ Key = 'kecamatan_id'; Value = 'wilayah_adm_kecamatan_id' }
    @{ Key = 'kelompok_id'; Value = 'wilayah_fung_kelompok_id' }
    @{ Key = 'pusat_id'; Value = 'wilayah_fung_pusat_id' }
    @{ Key = 'daerah_id'; Value = 'wilayah_fung_daerah_id' }
    @{ Key = 'desa_id'; Value = 'wilayah_fung_desa_id' }
)

$permPairs = @(
    @{ Key = 'adm_desa_kelurahan'; Value = 'wilayah_adm_desa' }
    @{ Key = 'adm_kabupaten_kota'; Value = 'wilayah_adm_kabupaten_kota' }
    @{ Key = 'adm_kecamatan'; Value = 'wilayah_adm_kecamatan' }
    @{ Key = 'adm_provinsi'; Value = 'wilayah_adm_provinsi' }
    @{ Key = 'adm_negara'; Value = 'wilayah_adm_negara' }
    @{ Key = 'adm_kode_pos'; Value = 'wilayah_adm_kode_pos' }
    @{ Key = 'sub_kelompok'; Value = 'wilayah_fung_sub_kelompok' }
    @{ Key = 'pusat.'; Value = 'wilayah_fung_pusat.' }
    @{ Key = 'daerah.'; Value = 'wilayah_fung_daerah.' }
    @{ Key = 'desa.'; Value = 'wilayah_fung_desa.' }
    @{ Key = 'kelompok.'; Value = 'wilayah_fung_kelompok.' }
)

$menuPairs = @(
    @{ Key = 'master-adm-desa-kelurahan'; Value = 'master-wilayah-adm-desa' }
    @{ Key = 'master-adm-kabupaten-kota'; Value = 'master-wilayah-adm-kabupaten-kota' }
    @{ Key = 'master-adm-kecamatan'; Value = 'master-wilayah-adm-kecamatan' }
    @{ Key = 'master-adm-provinsi'; Value = 'master-wilayah-adm-provinsi' }
    @{ Key = 'master-adm-negara'; Value = 'master-wilayah-adm-negara' }
    @{ Key = 'master-adm-kode-pos'; Value = 'master-wilayah-adm-kode-pos' }
    @{ Key = 'master-sub-kelompok'; Value = 'master-wilayah-fung-sub-kelompok' }
    @{ Key = 'master-kelompok'; Value = 'master-wilayah-fung-kelompok' }
    @{ Key = 'master-daerah'; Value = 'master-wilayah-fung-daerah' }
    @{ Key = 'master-desa'; Value = 'master-wilayah-fung-desa' }
    @{ Key = 'master-pusat'; Value = 'master-wilayah-fung-pusat' }
    @{ Key = 'wilayah-admin'; Value = 'wilayah-adm' }
)

$pathPairs = @(
    @{ Key = '/master/adm/desa-kelurahan'; Value = '/master/wilayah-adm/desa' }
    @{ Key = '/master/adm/kabupaten-kota'; Value = '/master/wilayah-adm/kabupaten-kota' }
    @{ Key = '/master/adm/kecamatan'; Value = '/master/wilayah-adm/kecamatan' }
    @{ Key = '/master/adm/provinsi'; Value = '/master/wilayah-adm/provinsi' }
    @{ Key = '/master/adm/negara'; Value = '/master/wilayah-adm/negara' }
    @{ Key = '/master/adm/kode-pos'; Value = '/master/wilayah-adm/kode-pos' }
    @{ Key = '/master/sub-kelompok'; Value = '/master/wilayah-fung/sub-kelompok' }
    @{ Key = '/master/kelompok'; Value = '/master/wilayah-fung/kelompok' }
    @{ Key = '/master/daerah'; Value = '/master/wilayah-fung/daerah' }
    @{ Key = '/master/desa'; Value = '/master/wilayah-fung/desa' }
    @{ Key = '/master/pusat'; Value = '/master/wilayah-fung/pusat' }
)

$routeParamPairs = @(
    @{ Key = '{adm_desa_kelurahan}'; Value = '{wilayah_adm_desa}' }
    @{ Key = '{adm_kabupaten_kota}'; Value = '{wilayah_adm_kabupaten_kota}' }
    @{ Key = '{adm_kecamatan}'; Value = '{wilayah_adm_kecamatan}' }
    @{ Key = '{adm_provinsi}'; Value = '{wilayah_adm_provinsi}' }
    @{ Key = '{adm_negara}'; Value = '{wilayah_adm_negara}' }
    @{ Key = '{adm_kode_pos}'; Value = '{wilayah_adm_kode_pos}' }
    @{ Key = '{sub_kelompok}'; Value = '{wilayah_fung_sub_kelompok}' }
    @{ Key = '{kelompok}'; Value = '{wilayah_fung_kelompok}' }
    @{ Key = '{daerah}'; Value = '{wilayah_fung_daerah}' }
    @{ Key = '{desa}'; Value = '{wilayah_fung_desa}' }
    @{ Key = '{pusat}'; Value = '{wilayah_fung_pusat}' }
)

$routeCallPairs = @(
    @{ Key = "route('adm_desa_kelurahan')"; Value = "route('wilayah_adm_desa')" }
    @{ Key = "route('adm_kabupaten_kota')"; Value = "route('wilayah_adm_kabupaten_kota')" }
    @{ Key = "route('adm_kecamatan')"; Value = "route('wilayah_adm_kecamatan')" }
    @{ Key = "route('adm_provinsi')"; Value = "route('wilayah_adm_provinsi')" }
    @{ Key = "route('adm_negara')"; Value = "route('wilayah_adm_negara')" }
    @{ Key = "route('adm_kode_pos')"; Value = "route('wilayah_adm_kode_pos')" }
    @{ Key = "route('sub_kelompok')"; Value = "route('wilayah_fung_sub_kelompok')" }
    @{ Key = "route('sub_kelompok_m')"; Value = "route('wilayah_fung_sub_kelompok')" }
    @{ Key = "route('kelompok')"; Value = "route('wilayah_fung_kelompok')" }
    @{ Key = "route('daerah')"; Value = "route('wilayah_fung_daerah')" }
    @{ Key = "route('desa')"; Value = "route('wilayah_fung_desa')" }
    @{ Key = "route('pusat')"; Value = "route('wilayah_fung_pusat')" }
)

$controllerParamPairs = @(
    @{ Key = 'int $sub_kelompok'; Value = 'int $wilayah_fung_sub_kelompok' }
    @{ Key = 'int $kelompok'; Value = 'int $wilayah_fung_kelompok' }
    @{ Key = 'int $daerah'; Value = 'int $wilayah_fung_daerah' }
    @{ Key = 'int $desa'; Value = 'int $wilayah_fung_desa' }
    @{ Key = 'int $pusat'; Value = 'int $wilayah_fung_pusat' }
    @{ Key = 'int $adm_desa_kelurahan'; Value = 'int $wilayah_adm_desa' }
    @{ Key = 'int $adm_kabupaten_kota'; Value = 'int $wilayah_adm_kabupaten_kota' }
    @{ Key = 'int $adm_kecamatan'; Value = 'int $wilayah_adm_kecamatan' }
    @{ Key = 'int $adm_provinsi'; Value = 'int $wilayah_adm_provinsi' }
    @{ Key = 'int $adm_negara'; Value = 'int $wilayah_adm_negara' }
    @{ Key = 'int $adm_kode_pos'; Value = 'int $wilayah_adm_kode_pos' }
)

$jsonKeyPairs = @(
    @{ Key = "'adm_desa_kelurahan'"; Value = "'wilayah_adm_desa'" }
    @{ Key = "'adm_kecamatan'"; Value = "'wilayah_adm_kecamatan'" }
    @{ Key = "'adm_kabupaten_kota'"; Value = "'wilayah_adm_kabupaten_kota'" }
    @{ Key = "'adm_provinsi'"; Value = "'wilayah_adm_provinsi'" }
    @{ Key = "'kelompok'"; Value = "'wilayah_fung_kelompok'" }
    @{ Key = "'daerah'"; Value = "'wilayah_fung_daerah'" }
    @{ Key = "'desa'"; Value = "'wilayah_fung_desa'" }
    @{ Key = "'pusat'"; Value = "'wilayah_fung_pusat'" }
)

$chromeKeyPairs = @(
    @{ Key = "'wilayah_fung_sub_kelompok_m'"; Value = "'wilayah_fung_sub_kelompok'" }
    @{ Key = "'wilayah_adm_negara_m'"; Value = "'wilayah_adm_negara'" }
    @{ Key = "'wilayah_adm_provinsi_m'"; Value = "'wilayah_adm_provinsi'" }
    @{ Key = "'wilayah_adm_kabupaten_kota_m'"; Value = "'wilayah_adm_kabupaten_kota'" }
    @{ Key = "'wilayah_adm_kecamatan_m'"; Value = "'wilayah_adm_kecamatan'" }
    @{ Key = "'wilayah_adm_desa_m'"; Value = "'wilayah_adm_desa'" }
    @{ Key = "'wilayah_adm_kode_pos_m'"; Value = "'wilayah_adm_kode_pos'" }
    @{ Key = "'pusat'"; Value = "'wilayah_fung_pusat'" }
    @{ Key = "'daerah'"; Value = "'wilayah_fung_daerah'" }
    @{ Key = "'desa'"; Value = "'wilayah_fung_desa'" }
    @{ Key = "'kelompok'"; Value = "'wilayah_fung_kelompok'" }
)

$changed = 0
foreach ($file in $files) {
    $original = [System.IO.File]::ReadAllText($file.FullName)
    $content = $original

    $content = Apply-Replacements $content $fkPairs
    $content = Apply-Replacements $content $permPairs
    $content = Apply-Replacements $content $menuPairs
    $content = Apply-Replacements $content $pathPairs
    $content = Apply-Replacements $content $routeParamPairs
    $content = Apply-Replacements $content $routeCallPairs
    $content = Apply-Replacements $content $controllerParamPairs

    if ($file.FullName -match 'Resource\.php$|DTOs\\|Form\\Requests\\') {
        $content = Apply-Replacements $content $jsonKeyPairs
    }

    if ($file.Name -eq 'RbacSeeder.php') {
        $content = Apply-Replacements $content $chromeKeyPairs
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $changed++
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Done. $changed files updated."
