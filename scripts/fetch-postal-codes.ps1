# Unduh kode pos Indonesia (lokabisa-oss/postal-code-id v2026Q1)
# Selaras dengan villages.csv (region-id / Kepmendagri 2025).

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$target = Join-Path $root 'backend\database\data\wilayah\postal_codes.csv'
$url = 'https://github.com/lokabisa-oss/postal-code-id/releases/download/v2026Q1/postal_codes_pos_indonesia.csv'

Write-Host "Mengunduh kode pos dari lokabisa-oss/postal-code-id ..."
New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
Invoke-WebRequest -Uri $url -OutFile $target -UseBasicParsing
Write-Host "Tersimpan: $target"
Write-Host "Jalankan seeder: docker exec sijama-backend-1 php artisan db:seed --class=KodePosSeeder"
