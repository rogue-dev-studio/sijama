#!/bin/sh
# Jalankan di Render Shell (sijama-api) — koneksi Render → Aiven lebih stabil dari lokal.
set -e

echo "== migrate:fresh =="
php artisan migrate:fresh --force

echo "== seeders (production-safe, tanpa DatabaseSeeder demo users) =="
php artisan db:seed --class=RbacSeeder --force
php artisan db:seed --class=KonfigSystemSeeder --force
php artisan db:seed --class=WilayahAdministrasiSeeder --force
php artisan db:seed --class=KodePosSeeder --force
php artisan db:seed --class=WilayahSeeder --force
php artisan db:seed --class=LookupMSeeder --force
php artisan db:seed --class=KonfigDokumenSeeder --force
php artisan db:seed --class=MasterEventSeeder --force
php artisan db:seed --class=HariLiburSeeder --force
php artisan db:seed --class=ProductionAdminSeeder --force

if [ "${BOOTSTRAP_DEMO_USERS:-false}" = "true" ]; then
  echo "== demo users =="
  php artisan db:seed --class=ProductionDemoUsersSeeder --force
fi

echo "== storage link =="
php artisan storage:link --force || true

echo "Done. Hapus BOOTSTRAP_ADMIN_* / BOOTSTRAP_DEMO_* dari env setelah login pertama berhasil."
