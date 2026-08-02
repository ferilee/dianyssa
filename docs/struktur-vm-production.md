# Struktur VM Production

Struktur ini direkomendasikan untuk VM sekolah yang menjalankan beberapa aplikasi Docker. Tujuannya adalah memisahkan source/configuration, data persisten, layanan platform bersama, backup, dan script operasional.

```text
/srv
├── apps
│   ├── dianyssa
│   │   ├── compose.yaml
│   │   ├── .env.production
│   │   ├── config/
│   │   └── deploy/
│   ├── idetech/
│   └── cybrabot/
│
├── platform
│   ├── traefik/
│   ├── monitoring/
│   └── arcane/
│
├── data
│   ├── dianyssa
│   │   ├── sqlite/
│   │   ├── logs/
│   │   └── backups/
│   ├── idetech/
│   ├── mariadb/
│   └── rustfs/
│
├── backups
│   ├── dianyssa/
│   └── system/
│
└── scripts
    ├── backup/
    ├── deploy/
    └── maintenance/
```

## Aturan penggunaan

- `/srv/apps/<app>` menyimpan Compose, konfigurasi aplikasi, dan file deployment; bukan data runtime yang penting.
- `/srv/data/<app>` menyimpan data persisten yang dimount ke container, seperti SQLite dan log lokal.
- `/srv/platform` digunakan untuk layanan bersama antaraplikasi, seperti reverse proxy, monitoring, dan Arcane.
- `/srv/backups` dipisahkan dari data aktif. Backup penting wajib disalin lagi ke lokasi offsite, seperti S3 atau NAS sekolah.
- Artifact RPP DOCX/PDF disimpan di S3; disk VM hanya dipakai untuk SQLite, log sementara, dan backup lokal.
- Jangan memakai folder home untuk deployment production.

## Permission rahasia

Simpan `.env.production` di folder aplikasi dengan permission ketat:

```bash
chmod 600 /srv/apps/dianyssa/.env.production
```

## Lokasi Dianyssa

```text
/srv/apps/dianyssa
/srv/data/dianyssa
/srv/backups/dianyssa
```
