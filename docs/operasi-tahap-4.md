# Operasi Tahap 4

## Health check

Endpoint publik `GET /healthz` dipakai oleh Docker healthcheck dan dapat dipantau oleh uptime monitor.

- `200` / `status: ok`: database dapat diakses dan loop worker masih berjalan.
- `503` / `status: degraded`: loop worker tidak berdetak lebih dari 20 detik.
- `503` / `status: down`: database tidak dapat dibaca.

Respons juga memuat jumlah job `failed` dan lease `processing` yang sudah kedaluwarsa. Nilai tersebut adalah sinyal alert; job gagal tidak otomatis membuat aplikasi down karena retry manual masih mungkin dilakukan.

## Log worker

Worker menulis satu baris JSON per peristiwa penting: `job_started`, `job_completed`, `job_retry_scheduled`, `job_failed`, dan `lease_recovered`. Field pentingnya meliputi `jobId`, jumlah percobaan, format, error, dan `renderLatencyMs`.

Contoh pemantauan cepat:

```bash
docker logs dianyssa-agent --since 15m | rg 'rpp-export-worker'
curl -fsS http://127.0.0.1:3000/healthz
```

Alert yang direkomendasikan:

- `/healthz` mengembalikan `503` selama dua kali pemeriksaan berurutan;
- `jobs.failed` lebih dari nol selama 15 menit;
- `jobs.expiredLeases` lebih dari nol selama 5 menit.

## Backup dan restore SQLite

Backup harian dijalankan dari host Docker. Image aplikasi menyertakan `sqlite3`; skrip membuat snapshot memakai perintah SQLite `.backup`, sehingga konsisten saat database memakai WAL.

```bash
./scripts/backup-sqlite.sh /var/backups/dianyssa 14
```

Untuk restore, hentikan aplikasi terlebih dahulu. Skrip restore membuat salinan pengaman dari database saat ini sebelum menimpa file target:

```bash
docker compose -f docker-compose.prod.yml stop app
./scripts/restore-sqlite.sh /var/backups/dianyssa/app.db.20260720T020000Z.gz
docker compose -f docker-compose.prod.yml start app
curl -fsS http://127.0.0.1:3000/healthz
```

Lakukan restore terlebih dahulu di lingkungan staging; backup database tidak mencakup artifact object storage R2, sehingga bucket R2 perlu mempunyai lifecycle/replication backup sendiri.
