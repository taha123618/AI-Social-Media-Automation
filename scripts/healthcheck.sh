#!/bin/bash
# ==============================================================================
# Health Check Diagnostic Script
# Verifies Web Server, Database, and Redis Health
# ==============================================================================

set -e

PORT="${PORT:-3000}"
HOST="${HOST:-localhost}"
URL="http://${HOST}:${PORT}/api/health"

echo "🔍 Probing application health at ${URL}..."

RESPONSE=$(curl -s -w "\n%{http_code}" "${URL}")
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Application is HEALTHY (HTTP 200)"
  echo "$HTTP_BODY" | grep -o '"status":"[^"]*' | head -n 1
  exit 0
else
  echo "❌ Application Health Check FAILED with HTTP ${HTTP_STATUS}"
  echo "$HTTP_BODY"
  exit 1
fi
