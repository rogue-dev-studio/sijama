$root = Split-Path -Parent $PSScriptRoot
$fixes = @(
    @{ Old = 'wilayah_adm_wilayah_fung_desa'; New = 'wilayah_adm_desa' }
    @{ Old = 'wilayah_fung_sub_wilayah_fung_kelompok'; New = 'wilayah_fung_sub_kelompok' }
    @{ Old = 'admin.wilayah_fung_pusat.'; New = 'admin.pusat.' }
    @{ Old = 'admin.wilayah_fung_daerah.'; New = 'admin.daerah.' }
    @{ Old = 'admin.wilayah_fung_desa.'; New = 'admin.desa.' }
    @{ Old = 'admin.wilayah_fung_kelompok.'; New = 'admin.kelompok.' }
)
$files = Get-ChildItem -Path $root -Recurse -Include *.php,*.sql -File |
    Where-Object { $_.FullName -notmatch '\\vendor\\|\\storage\\' }
$count = 0
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $orig = $content
    foreach ($fix in $fixes) {
        $content = $content.Replace($fix.Old, $fix.New)
    }
    if ($content -ne $orig) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $count++
    }
}
Write-Host "Fixed $count files"
