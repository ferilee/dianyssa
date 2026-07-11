# Panduan Deploy Production dianyssa-agent

Panduan ini menjelaskan cara men-deploy **dianyssa-agent** ke server production menggunakan **GitHub Container Registry (GHCR)** dan **Docker Compose**, dengan **Caddy** sebagai reverse proxy SSL.

---

## 1. Persyaratan

- Server VPS dengan OS Linux (Ubuntu/Debian direkomendasikan).
- Docker & Docker Compose terinstall.
- Domain yang sudah menunjuk ke IP server (contoh: `rpp.sekolahmu.id`).
- Akun GitHub dengan akses ke repository ini.
- Bot Telegram sudah dibuat via [@BotFather](https://t.me/BotFather).

---

## 2. Rotasi Secret yang Sudah Terekspos

> **PENTING:** File `.env` saat ini masih tersimpan di Git dan berisi secret nyata. Segera rotasi semua secret sebelum production.

```bash
# Hapus .env dari tracking Git
git rm --cached .env
git commit -m "chore: remove .env from repository"
git push

# Rotasi secret di luar kode:
# - Telegram Bot Token (minta ke @BotFather)
# - Gemini API Key
# - Telegram Channel ID (jika berubah)
# - Telegram Webhook Secret
```

---

## 3. Build & Push Image ke GHCR

Repository ini sudah punya workflow `.github/workflows/publish.yml`.

1. Push commit ke branch `main`.
2. Buka **GitHub → Actions → Publish Docker Image to GHCR**.
3. Klik **Run workflow**.
4. Isi tag, misalnya `v1.0.0`, lalu jalankan.
5. Setelah selesai, image tersedia di:
   - `ghcr.io/ferilee/dianyssa:v1.0.0`
   - `ghcr.io/ferilee/dianyssa:latest`

> **Saran production:** selalu gunakan tag spesifik (`v1.0.0`), bukan `latest`, agar rollback mudah.

---

## 4. Siapkan Server

### 4.1 Install Docker & Docker Compose

Ikuti panduan resmi:
- [Docker Engine](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 4.2 Buat Docker Network

```bash
docker network create ferileenet
```

### 4.3 Login ke GHCR di Server

```bash
docker login ghcr.io -u GITHUB_USERNAME -p GITHUB_TOKEN
```

Gunakan GitHub Personal Access Token (PAT) dengan scope `read:packages`.

---

## 5. Konfigurasi Environment

1. Copy template environment production:

```bash
cp .env.production.example .env.production
```

2. Isi `.env.production` dengan nilai yang benar:

```env
IMAGE_TAG=v1.0.0
APP_DOMAIN=rpp.sekolahmu.id
APP_URL=https://rpp.sekolahmu.id
PORT=3000

TELEGRAM_BOT_TOKEN=your_new_bot_token
INITIAL_ADMIN_TELEGRAM_ID=your_telegram_user_id
TELEGRAM_ARCHIVE_CHANNEL_ID=your_channel_id
TELEGRAM_WEBHOOK_SECRET=your_random_secret

GEMINI_API_KEY=your_new_gemini_key
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta

DATABASE_URL=/app/data/app.db
```

3. Pastikan permission file aman:

```bash
chmod 600 .env.production
```

---

## 6. Deploy dengan Docker Compose

Pastikan `Caddyfile` dan `docker-compose.prod.yml` sudah ada di server, lalu jalankan:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Cek status:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
```

---

## 7. Daftarkan Telegram Webhook

Setelah domain SSL aktif, daftarkan webhook ke Telegram dengan memanggil endpoint setup bawaan Agent-Native:

```bash
curl -X POST "https://rpp.sekolahmu.id/_agent-native/integrations/telegram/setup"
```

Jika berhasil, Telegram akan mulai mengirim update ke aplikasi. Endpoint webhook yang digunakan adalah:

```text
POST /_agent-native/integrations/telegram/webhook
```

---

## 8. Verifikasi Deploy

1. Buka `https://rpp.sekolahmu.id` di browser. Landing page portal harus muncul.
2. Kirim `/start` ke bot Telegram.
3. Jika Anda adalah user pertama, bot akan otomatis menjadikan Anda admin.
4. Tambahkan guru dengan perintah:
   ```text
   /addguru <id_telegram> <Nama Lengkap>
   ```
5. Coba buat RPP dan cetak PDF.

---

## 9. Backup Database

Database SQLite disimpan di volume Docker `sqlite_data`. Backup manual:

```bash
docker cp dianyssa-agent:/app/data/app.db ./backup/app.db.$(date +%F-%H%M)
```

Atau buat cron harian:

```bash
# crontab -e
0 2 * * * docker cp dianyssa-agent:/app/data/app.db /backups/dianyssa/app.db.$(date +\%F) && find /backups/dianyssa -type f -mtime +7 -delete
```

---

## 10. Update & Rollback

### Update ke versi baru

1. Build & push image baru dengan tag, misalnya `v1.1.0`.
2. Edit `IMAGE_TAG=v1.1.0` di `.env.production`.
3. Jalankan:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Rollback ke versi sebelumnya

```bash
# Ubah IMAGE_TAG ke versi lama di .env.production
sed -i 's/IMAGE_TAG=v1.1.0/IMAGE_TAG=v1.0.0/' .env.production
docker compose -f docker-compose.prod.yml up -d
```

---

## 11. Troubleshooting

### Container app tidak bisa start

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

Periksa apakah:
- Secret `.env.production` sudah benar.
- Image GHCR bisa di-pull.
- Permission `/app/data` writable oleh user `node`.

### Webhook Telegram tidak berfungsi

Pastikan:
- Domain HTTPS sudah aktif dan mengarah ke server.
- `APP_URL` di `.env.production` sesuai domain.
- Sudah memanggil `POST /_agent-native/integrations/telegram/setup`.

### PDF tidak ter-generate

Pastikan:
- `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser` sudah ter-set di image.
- Container punya cukup RAM (minimum 1 GB, direkomendasikan 2 GB+).

---

## 12. Alternatif Deploy dengan Arcane UI

Jika kamu ingin mengelola container melalui antarmuka web, kamu bisa menggunakan **[Arcane UI](https://getarcane.app)**.

### 12.1 Install Arcane UI

Di server, jalankan:

```bash
docker compose -f arcane-compose.yml up -d
```

Isi dulu `ENCRYPTION_KEY` dan `JWT_SECRET` di `arcane-compose.yml` dengan string acak 32 karakter.

Arcane akan tersedia di `http://<ip-server>:3552`. Untuk akses dari internet, arahkan subdomain (misalnya `arcane.sekolahmu.id`) ke port 3552 via reverse proxy.

### 12.2 Deploy Project dianyssa-agent dari Arcane

Folder `deploy/arcane/` sudah disiapkan sebagai project Arcane.

Cara deploy:

1. Copy atau sync folder `deploy/arcane/` ke Arcane Projects Directory, misalnya:
   ```bash
   mkdir -p /opt/arcane/projects/dianyssa
   cp -r deploy/arcane/* /opt/arcane/projects/dianyssa/
   ```

2. Di Arcane UI, buat **Project → Local Directory** dan pilih `/opt/arcane/projects/dianyssa`.

3. Buka tab **Environment Variables** di Arcane, lalu isi semua variabel dari `deploy/arcane/.env.example`.

4. Klik **Deploy/Up**. Arcane akan menjalankan `app` dan `caddy` dalam satu project.

5. Setelah domain HTTPS aktif, daftarkan webhook Telegram:
   ```bash
   curl -X POST "https://rpp.sekolahmu.id/_agent-native/integrations/telegram/setup"
   ```

### 12.3 Keunggulan Arcane

- Kelola container, log, image, volume, dan environment variables dari browser.
- Update image cukup ubah `IMAGE_TAG` di Environment Variables Arcane, lalu klik **Redeploy**.
- Tidak perlu login SSH setiap kali deploy.

---

## 13. Catatan Keamanan

- Jangan pernah commit `.env.production` atau file `.env` Arcane ke Git.
- Gunakan tag image spesifik, hindari `latest` di production.
- Arcane punya akses ke Docker socket host — pastikan `ENCRYPTION_KEY` dan `JWT_SECRET` kuat, dan batasi akses ke UI Arcane.
- Pertimbangkan migrasi ke PostgreSQL/MySQL jika traffic tinggi, karena SQLite kurang ideal untuk concurrent write.
- Selalu backup database sebelum update besar.
