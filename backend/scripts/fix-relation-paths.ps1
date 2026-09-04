$root = Split-Path -Parent $PSScriptRoot
$files = Get-ChildItem -Path $root -Recurse -Include *.php -File |
    Where-Object { $_.FullName -notmatch '\\vendor\\|\\storage\\|\\scripts\\' }
$replacements = @(
    @{ Old = 'wilayah-admistrasi'; New = 'wilayah-adm' }
    @{ Old = 'wilayah_fung_kelompok.wilayah_fung_desa.daerah'; New = 'kelompok.desa.daerah' }
    @{ Old = 'wilayah_fung_kelompok.desa'; New = 'kelompok.desa' }
    @{ Old = 'wilayah_fung_desa.daerah'; New = 'desa.daerah' }
    @{ Old = "->load('wilayah_fung_kelompok"; New = "->load('kelompok" }
    @{ Old = "->loadMissing('wilayah_fung_kelompok"; New = "->loadMissing('kelompok" }
    @{ Old = "->with(['wilayah_fung_kelompok"; New = "->with(['kelompok" }
    @{ Old = "->with('wilayah_fung_kelompok"; New = "->with('kelompok" }
    @{ Old = "whereHas('wilayah_fung_kelompok"; New = "whereHas('kelompok" }
    @{ Old = "orWhereHas('wilayah_fung_kelompok"; New = "orWhereHas('kelompok" }
    @{ Old = "whenLoaded('wilayah_fung_kelompok'"; New = "whenLoaded('kelompok'" }
    @{ Old = "whenLoaded('wilayah_fung_desa'"; New = "whenLoaded('desa'" }
    @{ Old = "whenLoaded('wilayah_fung_daerah'"; New = "whenLoaded('daerah'" }
    @{ Old = "whenLoaded('wilayah_fung_pusat'"; New = "whenLoaded('pusat'" }
    @{ Old = 'dashboard.jamaah_wilayah_fung_kelompok.view'; New = 'dashboard.jamaah_kelompok.view' }
    @{ Old = 'belum memiliki wilayah_fung_kelompok'; New = 'belum memiliki kelompok' }
    @{ Old = 'tingkat wilayah_fung_kelompok'; New = 'tingkat kelompok' }
)
$count = 0
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $orig = $content
    foreach ($r in $replacements) {
        $content = $content.Replace($r.Old, $r.New)
    }
    if ($content -ne $orig) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $count++
    }
}
Write-Host "Fixed $count files"
