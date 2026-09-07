#!/bin/sh
# ==============================================================================
# BullMQ Background Worker Healthcheck Probe
# Checks timestamp of worker heartbeat file
# ==============================================================================

HEARTBEAT_FILE="${HEARTBEAT_FILE:-/tmp/worker-heartbeat}"

if [ ! -f "$HEARTBEAT_FILE" ]; then
  echo "❌ Worker healthcheck failed: heartbeat file not found at ${HEARTBEAT_FILE}"
  exit 1
fi

# Detect OS stat command (Linux stat -c %Y vs BSD/macOS stat -f %m)
LAST_MOD=$(stat -c %Y "$HEARTBEAT_FILE" 2>/dev/null || stat -f %m "$HEARTBEAT_FILE" 2>/dev/null || echo 0)
NOW=$(date +%s)
DIFF=$((NOW - LAST_MOD))

# If diff is greater than 60 seconds, worker is considered stalled or deadlocked
if [ "$DIFF" -gt 60 ]; then
  echo "❌ Worker healthcheck failed: heartbeat is stale (${DIFF}s ago, max threshold 60s)"
  exit 1
fi

echo "✅ Worker is healthy (heartbeat updated ${DIFF}s ago)"
exit 0
