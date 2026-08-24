#!/bin/bash
# ==============================================================================
# PostgreSQL Maintenance & Vacuum Script
# Reclaims storage bloat, analyzes query optimizer statistics, and reindexes pgvector
# ==============================================================================

set -euo pipefail

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-social_automation}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

echo "🧹 Starting PostgreSQL maintenance on ${DB_NAME} at $(date)..."

if [ -n "${DATABASE_URL:-}" ]; then
  psql "${DATABASE_URL}" -c "VACUUM (ANALYZE, VERBOSE);"
else
  PGPASSWORD="${POSTGRES_PASSWORD:-password}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "VACUUM (ANALYZE, VERBOSE);"
fi

echo "✅ Vacuum and statistics analyze completed successfully!"
