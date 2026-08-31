#!/bin/bash
set -euo pipefail

cd /var/www/html

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
  else
    touch .env
  fi
fi

mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Bind-mount can ship a host packages.php that references require-dev providers
# while the vendor volume came from a --no-dev image layer.
rm -f bootstrap/cache/packages.php bootstrap/cache/services.php

if [ ! -f vendor/autoload.php ]; then
  echo "Installing PHP dependencies (vendor volume empty)..."
  composer install --no-interaction --prefer-dist --no-dev
fi

php artisan package:discover --ansi || true

export PGSSLMODE="${DB_SSLMODE:-prefer}"

echo "Waiting for PostgreSQL at ${DB_HOST:-db}:${DB_PORT:-5432} (sslmode=${PGSSLMODE})..."
until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME:-sijama}" -d "${DB_DATABASE:-sijama}" > /dev/null 2>&1; do
  sleep 2
done
echo "Database is ready."

if [ -z "${APP_KEY:-}" ] && ! grep -qE '^APP_KEY=base64:[A-Za-z0-9+/=]+$' .env; then
  echo "Generating application key..."
  php artisan key:generate --force
fi

ROLE="${CONTAINER_ROLE:-web}"

if [ "$ROLE" = "scheduler" ]; then
  echo "Starting Laravel scheduler..."
  exec php artisan schedule:work
fi

php artisan migrate --force

UPLOAD_DISK="${FILESYSTEM_UPLOAD_DISK:-}"
if [ -z "$UPLOAD_DISK" ]; then
  if [ "${FILESYSTEM_DISK:-local}" = "s3" ]; then
    UPLOAD_DISK="s3"
  else
    UPLOAD_DISK="public"
  fi
fi

if [ "$UPLOAD_DISK" != "s3" ]; then
  php artisan storage:link --force || true
else
  echo "Upload disk is s3 — skipping storage:link (media served via /storage proxy)."
fi

# Render free tier: no Shell — set SEED_ON_DEPLOY=true once in Dashboard, redeploy, then unset.
if [ "${SEED_ON_DEPLOY:-false}" = "true" ]; then
  echo "SEED_ON_DEPLOY=true — running production seed..."
  if [ -f scripts/seed-aiven-only.sh ]; then
    bash scripts/seed-aiven-only.sh
  else
    echo "scripts/seed-aiven-only.sh not found; seed skipped."
  fi
  echo "Seed finished. Remove SEED_ON_DEPLOY from env vars to avoid re-seeding on next deploy."
fi

LISTEN_PORT="${PORT:-80}"
if [ "${LISTEN_PORT}" != "80" ]; then
  sed -i "s/Listen 80/Listen ${LISTEN_PORT}/" /etc/apache2/ports.conf
  sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${LISTEN_PORT}>/" /etc/apache2/sites-available/000-default.conf
fi

exec apache2-foreground
