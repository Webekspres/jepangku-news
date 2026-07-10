#!/usr/bin/env bash
# Import thumbnail CSV on VPS: download images → R2 → update DB.
#
# Usage (on VPS):
#   DEPLOY_PATH=/opt/jepangku-staging bash prisma/seeder/vps-import-thumbnail-csv.sh
#   DEPLOY_PATH=/opt/jepangku ENV=production bash prisma/seeder/vps-import-thumbnail-csv.sh
#
# Requires: portal-berita repo at $DEPLOY_PATH/portal-berita with latest dev branch.

set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/jepangku-staging}"
ENV_TARGET="${ENV:-staging}"
PORTAL_DIR="${DEPLOY_PATH}/portal-berita"
CSV_PATH="${PORTAL_DIR}/prisma/seeder/update-thumbnail-kuis.csv"

if [ "$ENV_TARGET" = "production" ]; then
  DOCKER_NET="jepangku_net"
  DB_HOST="jepangku_db"
  DB_NAME="jepangku_portal"
else
  DOCKER_NET="jepangku_staging_net"
  DB_HOST="jepangku_staging_db"
  DB_NAME="stg_jepangku_portal"
fi

if [ ! -f "${DEPLOY_PATH}/.env" ]; then
  echo "Missing ${DEPLOY_PATH}/.env"
  exit 1
fi

if [ ! -f "$CSV_PATH" ]; then
  echo "Missing CSV: $CSV_PATH"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${DEPLOY_PATH}/.env"
set +a

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}"

echo "==> Import thumbnails ($ENV_TARGET)"
echo "    Portal: $PORTAL_DIR"
echo "    DB: $DATABASE_URL"

docker run --rm \
  --network "$DOCKER_NET" \
  -v "${PORTAL_DIR}:/app" \
  -w /app \
  -e DATABASE_URL \
  -e R2_ACCOUNT_ID \
  -e R2_ACCESS_KEY_ID \
  -e R2_ACCESS_KEY_SECRET \
  -e R2_BUCKET_NAME \
  -e R2_PUBLIC_URL \
  -e SEED_IMAGE_PUBLIC_URL \
  oven/bun:1 \
  sh -c "bun install --frozen-lockfile && node prisma/seeder/import-thumbnail-csv-to-r2.mjs prisma/seeder/update-thumbnail-kuis.csv --write-sql"

echo "==> Done"
