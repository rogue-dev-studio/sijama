#!/bin/sh
# Seed yang belum jalan (skip Rbac + ProductionAdmin jika sudah ada).
set -e

echo "== KonfigSystem =="
php artisan db:seed --class=KonfigSystemSeeder --force

echo "== WilayahAdministrasi =="
php artisan db:seed --class=WilayahAdministrasiSeeder --force

echo "== KodePos =="
php artisan db:seed --class=KodePosSeeder --force

echo "== Wilayah organisasi =="
php artisan db:seed --class=WilayahSeeder --force

echo "== LookupM =="
php artisan db:seed --class=LookupMSeeder --force

echo "== KonfigDokumen =="
php artisan db:seed --class=KonfigDokumenSeeder --force

echo "== MasterEvent =="
php artisan db:seed --class=MasterEventSeeder --force

echo "== HariLibur =="
php artisan db:seed --class=HariLiburSeeder --force

echo "Remaining seed done (akun demo via WilayahSeeder)."
