$root = Split-Path -Parent $PSScriptRoot
$files = Get-ChildItem -Path $root -Recurse -Include *.php,*.sql -File |
    Where-Object { $_.FullName -notmatch '\\vendor\\|\\storage\\' }
$count = 0
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $orig = $content
    $content = $content.Replace('wilayah_fung_wilayah_fung_sub_kelompok_m', 'wilayah_fung_sub_kelompok_m')
    if ($content -ne $orig) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $count++
    }
}
Write-Host "Fixed $count files"
