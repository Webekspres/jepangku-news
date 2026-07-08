#!/usr/bin/env bash
set -euo pipefail
for i in $(seq 1 15); do
  curl -sf http://localhost:3100/ready >/dev/null && break
  sleep 2
done
END=$(date +%s)000000000
START=$((END - 3600000000000))
RESULT=$(curl -sf "http://localhost:3100/loki/api/v1/query_range?query=%7Bservice%3D%22jepangku-news%22%7D&limit=3&start=${START}&end=${END}")
echo "$RESULT" | grep -q '"values"' || { echo "No log values: $RESULT"; exit 1; }
echo "Loki pipeline OK — service=jepangku-news logs found"
echo "$RESULT" | head -c 400
