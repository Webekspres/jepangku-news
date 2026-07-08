#!/usr/bin/env bash
set -euo pipefail
TS=$(date +%s)000000000
curl -sf -X POST http://localhost:3100/loki/api/v1/push \
  -H 'Content-Type: application/json' \
  -d "{\"streams\":[{\"stream\":{\"job\":\"e2e-test\"},\"values\":[[\"${TS}\",\"manual push test\"]]}]}"
echo "push ok"
sleep 2
END=$(date +%s)000000000
START=$((END - 60000000000))
curl -sf "http://localhost:3100/loki/api/v1/query_range?query=%7Bjob%3D%22e2e-test%22%7D&limit=1&start=${START}&end=${END}"
