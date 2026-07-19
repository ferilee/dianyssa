# Log Pekerjaan — Fondasi RPP Bot

Tanggal: 19 Juli 2026

## Ringkasan

Fondasi aplikasi RPP Bot telah dibangun hingga alur utama dapat berjalan secara aman: guru membuat RPP terstruktur, menyetujuinya, mengekspor DOCX/PDF melalui antrean background, lalu memantau dan mengunduh hasil dari dashboard.

## Pekerjaan yang selesai

- Memperbaiki baseline typecheck dan menambahkan perintah test.
- Mengamankan bootstrap admin agar hanya memakai `INITIAL_ADMIN_TELEGRAM_ID`.
- Mengganti cookie Telegram ID mentah dengan magic link hash dan session portal opaque server-side.
- Menegakkan authorization/ownership pada action RPP, ekspor, dan integrasi IdeTech.
- Menambahkan schema RPP Pembelajaran Mendalam tervalidasi sebagai JSON source of truth.
- Menambahkan lifecycle `draft` → `approved` sebelum dokumen dapat diekspor.
- Menambahkan renderer DOCX deterministik dan artifact storage lokal.
- Mempertahankan PDF sebagai format tambahan serta menghapus ketergantungan CDN saat render PDF.
- Menambahkan artifact metadata: format, storage key, checksum, ukuran, dan status.
- Menambahkan antrean export background dengan retry, exponential backoff, lease recovery, dan claim atomik.
- Menambahkan status job, retry manual, notifikasi Telegram saat gagal permanen, serta route unduh artifact yang aman.
- Memperbarui dashboard dengan status export, artifact download, polling saat job aktif, retry job gagal, dan query batch.
- Menghapus dua action IdeTech yang terbukti tidak memiliki pemanggil aktif: `get-parent-reports` dan `get-student-study-context`.

## Commit utama

- `2f354bf` Harden RPP bot authentication baseline
- `f3dd313` Add structured RPP draft lifecycle
- `8ef236d` Add DOCX RPP artifact pipeline
- `b8d65f8` Queue RPP document exports in background
- `abd72cc` Make export job processing resilient
- `6c1dc10` Retry failed export jobs from dashboard
- `af91793` Remove unused student and parent actions

## Verifikasi

Pengecekan yang telah dijalankan selama pekerjaan:

```text
pnpm typecheck
bun test
git diff --check
```

Pada checkpoint terakhir, suite Bun memiliki 9 test lulus tanpa kegagalan dan typecheck lulus.

## Batasan saat ini

- Artifact masih memakai filesystem lokal; deployment production perlu object/blob storage.
- Worker queue cocok untuk satu instance. Untuk multi-instance, claim job perlu disesuaikan dengan database/queue production yang dipakai.
- Dashboard telah memuat status dan artifact, tetapi tampilan status/error masih dapat dipoles.
- PDF lama masih menggunakan renderer Markdown sederhana; template PDF sebaiknya disatukan lebih lanjut dengan model RPP terstruktur.
- Model organisasi/sekolah multi-tenant belum diterapkan.
- Belum ada pengujian end-to-end terhadap Telegram Bot API nyata.

## Rekomendasi kelanjutan

1. Tambahkan object storage production dan backup artifact/database.
2. Buat pengujian end-to-end: Telegram → RPP → approval → queue → DOCX/PDF → dashboard.
3. Terapkan scope organisasi/sekolah untuk multi-tenant.
4. Rapikan layout DOCX/PDF resmi dan tambah template per sekolah.
5. Tambahkan observability: metrics job, audit trail, dan alert kegagalan berulang.
