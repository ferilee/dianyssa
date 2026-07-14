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
# Catatan konsistensi: SQLite menggunakan WAL mode sehingga docker cp
# terhadap file .db utama sudah cukup aman untuk kebanyakan use case.
# Untuk backup 100% konsisten saat ada transaksi berjalan, tambahkan
# sqlite3 CLI di image dan gunakan `sqlite3 ... ".backup /tmp/snap"`.

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
if ! docker cp "${CONTAINER_NAME}:${CONTAINER_DB_PATH}" - | gzip > "${BACKUP_FILE}"; then
  log "ERROR: backup gagal"
  rm -f "${BACKUP_FILE}"
  exit 1
fi

SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log "OK: ${BACKUP_FILE} (${SIZE})"

# Rotasi backup yang lebih lama dari RETENTION_DAYS
DELETED=$(find "${BACKUP_DIR}" -maxdepth 1 -type f -name 'app.db.*.gz' \
  -mtime "+${RETENTION_DAYS}" -print -delete | wc -l)
if [ "${DELETED}" -gt 0 ]; then
  log "rotate: hapus ${DELETED} backup > ${RETENTION_DAYS} hari"
fi

log "done"
