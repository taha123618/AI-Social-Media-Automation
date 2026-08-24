#!/bin/bash
# ==============================================================================
# PostgreSQL Database Restoration Script
# Usage: ./scripts/restore-db.sh <path_to_backup.sql.gz>
# ==============================================================================

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "❌ Error: Please specify the backup file to restore."
  echo "Usage: $0 <path_to_backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file not found at ${BACKUP_FILE}"
  exit 1
fi

echo "⚠️  WARNING: This will overwrite data in the target database."
read -p "Are you sure you want to restore from ${BACKUP_FILE}? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
  echo "🛑 Restoration cancelled."
  exit 0
fi

echo "🔄 Restoring database from ${BACKUP_FILE}..."

if [ -n "${DATABASE_URL:-}" ]; then
  gunzip -c "${BACKUP_FILE}" | psql "${DATABASE_URL}"
else
  DB_USER="${POSTGRES_USER:-postgres}"
  DB_NAME="${POSTGRES_DB:-social_automation}"
  DB_HOST="${POSTGRES_HOST:-localhost}"
  DB_PORT="${POSTGRES_PORT:-5432}"
  PGPASSWORD="${POSTGRES_PASSWORD:-password}" gunzip -c "${BACKUP_FILE}" | psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"
fi

echo "✅ Database restored successfully!"
echo "🔄 Verifying schema with Prisma generate..."
npx prisma generate
