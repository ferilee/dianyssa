#!/usr/bin/env bash
#
# Restore database SQLite dari backup yang dibuat backup-sqlite.sh.
# Container harus berhenti agar tidak ada transaksi yang tertimpa.
#
# Usage: ./scripts/restore-sqlite.sh /path/to/app.db.TIMESTAMP.gz

set -euo pipefail

BACKUP_FILE="${1:?Usage: $0 /path/to/app.db.TIMESTAMP.gz}"
CONTAINER_NAME="${CONTAINER_NAME:-dianyssa-agent}"
CONTAINER_DB_PATH="${CONTAINER_DB_PATH:-/app/data/app.db}"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

if ! command -v docker >/dev/null 2>&1; then
  log "ERROR: docker tidak ditemukan di PATH"
  exit 1
fi
if [ ! -f "$BACKUP_FILE" ]; then
  log "ERROR: backup tidak ditemukan: $BACKUP_FILE"
  exit 1
fi
if docker ps --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  log "ERROR: container '$CONTAINER_NAME' masih berjalan. Hentikan terlebih dahulu."
  exit 1
fi
if ! docker container inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
  log "ERROR: container '$CONTAINER_NAME' tidak ditemukan"
  exit 1
fi

RESTORE_FILE=$(mktemp)
trap 'rm -f "$RESTORE_FILE"' EXIT
gzip -cd -- "$BACKUP_FILE" > "$RESTORE_FILE"
if ! head -c 16 "$RESTORE_FILE" | grep -q '^SQLite format 3'; then
  log "ERROR: file bukan backup SQLite yang valid"
  exit 1
fi

SAFETY_COPY="./$(basename "$CONTAINER_DB_PATH").before-restore.$(date -u +%Y%m%dT%H%M%SZ)"
log "membuat salinan pengaman ${SAFETY_COPY}"
docker cp "${CONTAINER_NAME}:${CONTAINER_DB_PATH}" "$SAFETY_COPY"
log "restore ${BACKUP_FILE} -> ${CONTAINER_NAME}:${CONTAINER_DB_PATH}"
docker cp "$RESTORE_FILE" "${CONTAINER_NAME}:${CONTAINER_DB_PATH}"
log "OK. Jalankan container lalu periksa GET /healthz sebelum membuka akses publik."
