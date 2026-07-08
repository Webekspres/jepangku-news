#!/usr/bin/env bash
# E2E verification: logging stack (Loki + Promtail + Grafana) via Docker Engine WSL
# Run: wsl -e bash scripts/verify-logging-e2e.sh
set -euo pipefail

INFRA_DIR="/mnt/c/Users/PC/Projects/Projects/jepangku/jepangku-infra/logging"
NEWS_DIR="/mnt/c/Users/PC/Projects/Projects/jepangku/jepangku-news"
NETWORK="logging_jepangku-logging"
TEST_CONTAINER="jepangku-news-log-verify"
EMITTER="${NEWS_DIR}/scripts/e2e-log-emitter.sh"

echo "=== 1. Stack status ==="
cd "$INFRA_DIR"
docker compose -f docker-compose.logging.yml up -d
sleep 5
docker compose -f docker-compose.logging.yml ps

echo ""
echo "=== 2. Loki ready (wait up to 30s) ==="
for i in $(seq 1 15); do
  if curl -sf http://localhost:3100/ready >/dev/null 2>&1; then
    echo " OK"
    break
  fi
  echo "  waiting... ($i)"
  sleep 2
done
curl -sf http://localhost:3100/ready || { echo "Loki not ready"; exit 1; }

echo ""
echo "=== 3. Grafana health ==="
for i in $(seq 1 10); do
  if curl -sf http://localhost:3002/api/health >/dev/null 2>&1; then
    echo " OK"
    break
  fi
  echo "  waiting... ($i)"
  sleep 3
done
curl -sf http://localhost:3002/api/health || { echo "Grafana not healthy"; docker logs jepangku-grafana 2>&1 | tail -15; exit 1; }

echo ""
echo "=== 4. Start test log emitter (Pino JSON) ==="
docker rm -f "$TEST_CONTAINER" 2>/dev/null || true
docker run -d --name "$TEST_CONTAINER" --network "$NETWORK" \
  -v "${EMITTER}:/emit.sh:ro" alpine sh /emit.sh

echo "Waiting 20s for Promtail → Loki..."
sleep 20

echo ""
echo "=== 5. Query Loki for test logs (service=jepangku-news) ==="
END=$(date +%s)000000000
START=$((END - 3600000000000))
RESULT=$(curl -sf "http://localhost:3100/loki/api/v1/query_range?query=%7Bservice%3D%22jepangku-news%22%7D%20%7C%3D%20%22request.start%22&limit=5&start=${START}&end=${END}")
echo "$RESULT" | grep -q '"values"' || { echo "FAIL: $RESULT"; exit 1; }
echo "Log lines found: OK"
echo "Sample: $(echo "$RESULT" | grep -o 'request.start' | head -1)"

echo ""
echo "=== 6. Pino JSON stdout (production) — run on host: ==="
echo "  cd jepangku-news && NODE_ENV=production bun -e \"import { logger } from './lib/logger.ts'; logger.info('e2e.verify', { module: 'test' });\""

echo ""
echo "=== E2E verification PASSED ==="
