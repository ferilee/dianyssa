# Rencana Implementasi Lanjutan RPP Bot

Dokumen ini adalah roadmap setelah Tahap 1 — Fondasi Aplikasi. Kondisi fondasi saat ini dicatat di `docs/log-pekerjaan-2026-07-19.md`.

## Prinsip kerja

- Pertahankan action sebagai satu-satunya surface operasi bisnis.
- Jangan menambah fitur sebelum authorization, ownership, dan test pada surface terkait tersedia.
- Gunakan migrasi additive; jangan menghapus atau mengganti nama kolom/tabel yang telah dipakai.
- Jangan menyimpan isi file dokumen di SQL. Simpan hanya metadata dan storage key.
- Jalankan `pnpm typecheck`, `bun test`, dan `git diff --check` sebelum commit.

## Tahap 2 — Storage dan delivery production

Tujuan: artifact DOCX/PDF tidak bergantung pada disk lokal server.

1. Buat interface storage dengan dua adapter:
   - filesystem lokal untuk development;
   - object/blob storage untuk production, dipilih lewat environment.
2. Pindahkan `services/artifact-storage.ts` ke interface tersebut tanpa mengubah kontrak `rpp_artifacts`.
3. Tambahkan download adapter yang melakukan authorization sebelum mengalirkan file.
4. Pisahkan status render dari delivery Telegram:
   - artifact `rendered` setelah file tersimpan;
   - artifact/job `delivered` setelah Telegram mengonfirmasi pengiriman.
5. Simpan Telegram message ID bila tersedia agar delivery dapat dideteksi/dihindari duplikasinya.
6. Uji kegagalan storage dan kegagalan Telegram secara terpisah; retry delivery tidak boleh merender ulang artifact.

Selesai bila: aplikasi dapat di-deploy tanpa persistent local disk dan artifact tetap dapat diunduh setelah restart/redeploy.

## Tahap 3 — Quality dokumen dan template sekolah

Tujuan: output DOCX/PDF siap digunakan sebagai dokumen sekolah.

1. Finalisasi template DOCX: kop sekolah, metadata, struktur PM, tabel bila diperlukan, tanda tangan, NIP, dan pagination.
2. Ganti renderer PDF Markdown lama agar menggunakan model RPP JSON yang sama dengan DOCX.
3. Tambahkan template per sekolah, dipilih dari metadata sekolah/organisasi dan bukan dari prompt bebas.
4. Tambahkan validasi domain: dimensi profil lulusan, tujuan pembelajaran, asesmen, dan bagian wajib PM.
5. Uji hasil dengan Microsoft Word serta LibreOffice; tambah snapshot/fixture untuk layout penting.

Selesai bila: DOCX dan PDF dari satu RPP memiliki isi konsisten, tanpa placeholder kosong, dan dapat dibuka di aplikasi kantor umum.

## Tahap 4 — End-to-end dan operasi

Tujuan: alur nyata aman dipakai guru.

1. Tambahkan test E2E dengan Telegram API mock:
   - whitelist;
   - upload referensi;
   - draft → approval → queue → render → delivery;
   - retry dan worker restart;
   - akses lintas pengguna ditolak.
2. Tambahkan observability: log terstruktur job, latency render, retry count, delivery failure, dan audit action.
3. Tambahkan backup database dan artifact serta prosedur restore yang terdokumentasi.
4. Buat health check worker dan alert untuk job yang gagal berulang atau lease yang terus kedaluwarsa.

Selesai bila: kegagalan dapat didiagnosis dari log/metric dan alur utama tervalidasi tanpa Telegram/LLM sungguhan.

## Tahap 5 — Multi-sekolah dan produk lanjutan

Tujuan: aplikasi dapat dipakai lebih dari satu sekolah dengan isolasi data yang benar.

1. Tambahkan organisasi/sekolah sebagai tenant pertama.
2. Scope semua user, RPP, artifact, channel arsip, template, dan credential pada organisasi.
3. Bedakan admin platform, admin sekolah, dan guru.
4. Tambahkan revisi RPP berversi: draft baru tidak mengubah versi approved/artifact yang sudah ada.
5. Tambahkan OCR untuk PDF scan sebagai workflow opsional dengan batas ukuran dan biaya yang jelas.
6. Jadikan sinkronisasi IdeTech workflow opsional dengan status/retry terpisah dari proses RPP.

Selesai bila: data sekolah A tidak dapat diakses sekolah B, termasuk lewat dashboard, action, artifact, dan integrasi.

## Urutan eksekusi berikutnya

```text
Tahap 2: storage production + delivery terpisah
→ Tahap 3: template DOCX/PDF sekolah
→ Tahap 4: E2E, observability, backup
→ Tahap 5: multi-tenant, revisi, fitur lanjutan
```

Jangan melompati Tahap 2: filesystem lokal adalah batas utama sebelum deployment production yang dapat diandalkan.
