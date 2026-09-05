#!/bin/sh
# Seed saja (skip migrate) — DB schema sudah fresh dari migrate terakhir.
# Logs: stdout (Render) + storage/logs/seed-aiven.log
set -e

LOG_DIR="${LOG_DIR:-storage/logs}"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/seed-aiven.log"

log() {
  msg="[seed-aiven $(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
  echo "$msg"
  echo "$msg" >> "$LOG_FILE"
}

run_seeder() {
  class="$1"
  log "START $class"
  if php artisan db:seed --class="$class" --force; then
    log "OK    $class"
  else
    code=$?
    log "FAIL  $class (exit $code)"
    exit "$code"
  fi
}

log "==== production seed begin (APP_ENV=${APP_ENV:-unknown} DB_HOST=${DB_HOST:-unknown}) ===="

run_seeder RbacSeeder
run_seeder KonfigSystemSeeder
log "NOTE  WilayahAdministrasiSeeder can take a long time..."
run_seeder WilayahAdministrasiSeeder
log "NOTE  KodePosSeeder can take a long time..."
run_seeder KodePosSeeder
run_seeder WilayahSeeder
run_seeder LookupMSeeder
run_seeder KonfigDokumenSeeder
run_seeder MasterEventSeeder
run_seeder HariLiburSeeder
run_seeder ProductionAdminSeeder

log "START storage:link"
php artisan storage:link --force || true
log "OK    storage:link"
log "==== production seed done ===="
echo "Done."
