#!/usr/bin/env bash
#
# Backup SQLite database dari container dianyssa-agent ke host.
#
# Usage:
#   ./scripts/backup-sqlite.sh [BACKUP_DIR] [RETENTION_DAYS]
#
# Env vars (optional):
#   CONTAINER_NAME     default: dianyssa-agent
#   CONTAINER_DB_PATH  default: /app/data/app.db
#
# Cron contoh (jalankan tiap malam jam 02:00, simpan 14 hari):
#   0 2 * * * /opt/dianyssa-agent/scripts/backup-sqlite.sh /var/backups/dianyssa 14 >> /var/log/dianyssa-backup.log 2>&1
#
# Backup dibuat menggunakan perintah SQLite `.backup`, sehingga konsisten
# walaupun aplikasi sedang menulis database dalam WAL mode.

set -euo pipefail

CONTAINER_NAME="${CONTAINER_NAME:-dianyssa-agent}"
CONTAINER_DB_PATH="${CONTAINER_DB_PATH:-/app/data/app.db}"
BACKUP_DIR="${1:-./backups}"
RETENTION_DAYS="${2:-7}"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

if ! command -v docker >/dev/null 2>&1; then
  log "ERROR: docker tidak ditemukan di PATH"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  log "ERROR: container '$CONTAINER_NAME' tidak berjalan. Cek: docker ps"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_FILE="$BACKUP_DIR/app.db.${TIMESTAMP}.gz"

log "backup ${CONTAINER_NAME}:${CONTAINER_DB_PATH} -> ${BACKUP_FILE}"
SNAPSHOT_PATH="/tmp/rpp-bot-backup-${TIMESTAMP}.db"
if ! docker exec "$CONTAINER_NAME" sqlite3 "$CONTAINER_DB_PATH" ".backup '$SNAPSHOT_PATH'"; then
  log "ERROR: SQLite snapshot gagal"
  exit 1
fi
if ! docker cp "${CONTAINER_NAME}:${SNAPSHOT_PATH}" - | gzip > "${BACKUP_FILE}"; then
  log "ERROR: backup gagal"
  rm -f "${BACKUP_FILE}"
  docker exec "$CONTAINER_NAME" rm -f "$SNAPSHOT_PATH" || true
  exit 1
fi
docker exec "$CONTAINER_NAME" rm -f "$SNAPSHOT_PATH"

SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log "OK: ${BACKUP_FILE} (${SIZE})"

# Rotasi backup yang lebih lama dari RETENTION_DAYS
DELETED=$(find "${BACKUP_DIR}" -maxdepth 1 -type f -name 'app.db.*.gz' \
  -mtime "+${RETENTION_DAYS}" -print -delete | wc -l)
if [ "${DELETED}" -gt 0 ]; then
  log "rotate: hapus ${DELETED} backup > ${RETENTION_DAYS} hari"
fi

log "done"
