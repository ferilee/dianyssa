# Telegram Content Publishing

Fitur ini memungkinkan admin untuk membuat, mengelola, dan menghapus pengumuman (announcements) dan artikel blog di website IdeTech langsung dari Telegram bot.

## Menghubungkan Akun

Sebelum menggunakan fitur ini, setiap user harus menghubungkan akun Telegram dengan akun IdeTech mereka:

```
/hubungkan email@domain.com
```

Contoh:
```
/hubungkan admin@idetech.example
```

Setelah akun terhubung, sistem akan menyimpan mapping antara ID Telegram dan session token IdeTech. Setiap aksi berikutnya akan menggunakan session token tersebut, sehingga permission admin di IdeTech tetap berlaku.

## Perintah yang Tersedia

### Pengumuman (Announcements)

| Perintah | Fungsi |
|----------|--------|
| `/hubungkan email@...` | Menghubungkan akun Telegram ke IdeTech |
| `buat pengumuman <judul> <konten>` | Membuat pengumuman baru (aktif) |
| `daftar pengumuman` | Menampilkan 10 pengumuman terakhir |
| `aktifkan pengumuman <id>` | Mengaktifkan pengumuman |
| `nonaktifkan pengumuman <id>` | Menonaktifkan pengumuman |
| `hapus pengumuman <id>` | Menghapus pengumuman |

### Artikel Blog

| Perintah | Fungsi |
|----------|--------|
| `buat artikel <judul> <konten>` | Membuat artikel baru (default: draft) |
| `daftar artikel` | Menampilkan 10 artikel terakhir |
| `publikasikan artikel <id>` | Mempublikasikan artikel (draft → published) |
| `hapus artikel <id>` | Menghapus artikel |

## Environment Variables

Tambahkan variabel berikut ke `.env`:

```env
IDETECH_BASE_URL=https://idetech.ferilee.gurumuda.eu.org
IDETECH_API_KEY=        # optional, untuk testing/recovery admin key
```

## Permission

- **Admin-only** untuk Phase 1: hanya user dengan role `admin` di website IdeTech yang dapat melakukan aksi ini.
- Permission divalidasi di sisi `idetechapp` melalui middleware `requireRole(["admin"])` dan `requirePermission("blog.manage")`.
- Audit log di `idetechapp` akan mencatat user yang melakukan aksi (bukan bot).

## Flow Autentikasi

1. User mengirim `/hubungkan email@domain.com`
2. Bot memanggil endpoint `/api/auth/telegram-link` di `idetechapp`
3. `idetechapp` mengembalikan session token untuk user tersebut
4. Bot menyimpan mapping `telegramUserId → ideTechUserId → sessionToken` di SQLite lokal
5. Setiap aksi berikutnya menggunakan session token user tersebut

## Error Handling

| Skenario | Respons Bot |
|----------|-------------|
| User belum menghubungkan akun | "Akun Telegram belum dihubungkan dengan IdeTech. Ketik /hubungkan untuk memulai." |
| Title terlalu pendek | "Judul minimal 3 karakter, coba lagi." |
| Website API tidak dapat diakses | "Website sedang tidak bisa diakses. Coba lagi nanti." |
| Tidak ada izin | "Kamu tidak punya izin untuk ini." |
| Konten tidak ditemukan | "Konten dengan ID tersebut tidak ditemukan." |
| Status tidak valid | "Status yang diminta tidak valid untuk jenis konten ini." |

## Struktur File

```
dianyssa-agent/
├── actions/
│   ├── link-idetech-account.ts    # Aksi untuk menghubungkan akun
│   ├── manage-content.ts          # Buat/update pengumuman/artikel
│   ├── list-content.ts            # Daftar pengumuman/artikel
│   ├── toggle-content-status.ts   # Ubah status
│   └── delete-content.ts          # Hapus
├── lib/
│   ├── idetech-config.ts          # Konfigurasi base URL & endpoints
│   ├── idetech-client.ts          # HTTP client untuk API IdeTech
│   ├── resolve-session.ts         # Helper untuk mengambil session
│   ├── slug.ts                    # Generator slug dari judul
│   └── excerpt.ts                 # Generator excerpt dari konten
└── server/
    └── db/
        └── schema.ts              # Skema tabel ide_tech_sessions
```