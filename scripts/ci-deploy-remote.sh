#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/sijama}"

mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

echo "$REGISTRY_PASSWORD" | docker login -u "$REGISTRY_USER" --password-stdin "$REGISTRY"

export SIJAMA_BACKEND_IMAGE
export SIJAMA_FRONTEND_IMAGE

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec -T backend php artisan migrate --force

echo "Deploy finished."
