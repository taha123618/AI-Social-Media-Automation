#!/bin/bash
# ==============================================================================
# Automated PostgreSQL Backup Script with Gzip Compression & Retention Policy
# Usage: ./scripts/backup-db.sh [backup_directory]
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${1:-./backups/postgres}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/social_automation_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "📦 Starting database backup at $(date)..."

# Extract database parameters from DATABASE_URL or defaults
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-social_automation}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "🔌 Using DATABASE_URL connection string..."
  pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"
else
  echo "🔌 Using default host ${DB_HOST}:${DB_PORT} for database ${DB_NAME}..."
  PGPASSWORD="${POSTGRES_PASSWORD:-password}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "✅ Backup successfully created at: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Verify backup integrity
echo "🔍 Verifying gzip archive integrity..."
if gzip -t "${BACKUP_FILE}"; then
  echo "✅ Archive integrity test passed."
else
  echo "❌ Error: Backup archive corrupted!"
  exit 1
fi

# Optional offsite cloud sync to AWS S3 / Cloudflare R2
if [ -n "${AWS_BUCKET_NAME:-}" ] && command -v aws &> /dev/null; then
  echo "☁️ Uploading backup to S3 bucket: ${AWS_BUCKET_NAME}..."
  aws s3 cp "${BACKUP_FILE}" "s3://${AWS_BUCKET_NAME}/backups/postgres/$(basename "${BACKUP_FILE}")" || \
    echo "⚠️ S3 upload failed (continuing with local copy)"
fi

# Retention cleanup (remove backups older than RETENTION_DAYS)
echo "🧹 Purging backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "social_automation_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} \;

echo "🏁 Backup cycle completed."

