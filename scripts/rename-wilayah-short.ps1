# Rename wilayah_adm_* -> wilayah_adm_* and wilayah_fung_* -> wilayah_fung_*
$root = Join-Path $PSScriptRoot '..'
$excludeDirs = @('node_modules', 'vendor', 'dist', '.git', 'storage', 'bootstrap\cache')

function ShouldSkip([string]$path) {
    foreach ($d in $excludeDirs) {
        if ($path -match [regex]::Escape([IO.Path]::DirectorySeparatorChar + $d + [IO.Path]::DirectorySeparatorChar)) { return $true }
    }
    return $false
}

$extensions = @('*.php', '*.ts', '*.tsx', '*.sql', '*.md', '*.json', '*.ps1', '*.mjs')
$files = Get-ChildItem -Path $root -Recurse -File -Include $extensions | Where-Object { -not (ShouldSkip $_.FullName) }

$replacements = @(
    @{ Old = 'wilayah_adm_'; New = 'wilayah_adm_' },
    @{ Old = 'wilayah_fung_'; New = 'wilayah_fung_' },
    @{ Old = 'wilayah-adm'; New = 'wilayah-adm' },
    @{ Old = 'wilayah-fung'; New = 'wilayah-fung' }
)

foreach ($file in $files) {
    $content = [IO.File]::ReadAllText($file.FullName)
    $original = $content
    foreach ($r in $replacements) {
        $content = $content.Replace($r.Old, $r.New)
    }
    if ($content -ne $original) {
        [IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Updated: $($file.FullName.Substring($root.Length))"
    }
}

# Rename files whose names contain old prefixes (deepest first)
$renamePatterns = @(
    @{ Old = 'wilayah_adm_'; New = 'wilayah_adm_' },
    @{ Old = 'wilayah_fung_'; New = 'wilayah_fung_' }
)

foreach ($r in $renamePatterns) {
    Get-ChildItem -Path $root -Recurse -File | Where-Object {
        $_.Name -like "*$($r.Old)*" -and -not (ShouldSkip $_.FullName)
    } | Sort-Object { $_.FullName.Length } -Descending | ForEach-Object {
        $newName = $_.Name.Replace($r.Old, $r.New)
        $newPath = Join-Path $_.DirectoryName $newName
        if (-not (Test-Path $newPath)) {
            Move-Item -LiteralPath $_.FullName -Destination $newPath
            Write-Host "Renamed: $($_.Name) -> $newName"
        }
    }
}

Write-Host 'Done.'
