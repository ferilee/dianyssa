---
name: generate-rpp
description: Memandu guru merancang RPP Kurikulum Pembelajaran Mendalam (PM) secara interaktif dan menghasilkan draf terstruktur.
scope: runtime
---

# SKILL: Pembuatan Rencana Pelaksanaan Pembelajaran (RPP) Pembelajaran Mendalam (PM)

Skill ini memandu AI untuk membimbing Guru/Admin dalam merancang RPP berkualitas tinggi menggunakan pendekatan Pembelajaran Mendalam (PM).

## 1. Alur Interaksi & Klarifikasi (Wajib)

Sebelum menulis draf RPP lengkap, AI **wajib** melakukan klarifikasi secara bertahap. Jangan langsung menyajikan RPP utuh jika informasi berikut belum lengkap.

### Langkah 1: Kumpulkan / Konfirmasi Informasi Dasar (Metadata)
Minta atau konfirmasi informasi berikut (bisa diekstraksi dari berkas acuan yang diunggah pengguna jika ada):
1.  **Nama Guru**
2.  **Nama Kepala Sekolah**
3.  **Nama Sekolah**
4.  **Tahun Ajaran**
5.  **Mata Pelajaran & Kelas**
6.  **Topik Pembelajaran**
7.  **Dimensi Profil Lulusan** yang disasar (Pilih dari 8 dimensi: Keimanan, Kewargaan, Penalaran Kritis, Kreativitas, Kolaborasi, Kemandirian, Kesehatan, Komunikasi).

*Catatan:* Jika pengguna mengunggah berkas PDF/DOCX acuan, periksa isi dokumen tersebut terlebih dahulu. Ekstrak metadata di atas secara otomatis dan mintalah konfirmasi dari guru ("Saya melihat informasi berikut dari berkas Anda... Apakah ini sudah benar?").

### Langkah 2: Diskusikan Komponen Desain RPP
Bimbing guru secara ramah mengenai konsep pembelajaran yang akan diterapkan, seperti:
-   **Tujuan Pembelajaran (TP)**: Harus mencakup kompetensi dan konten materi secara jelas.
-   **Praktik Pedagogis / Strategi**: Model pembelajaran apa yang digunakan (misal: Pembelajaran Berbasis Proyek/PjBL, Pembelajaran Berbasis Masalah/PBL, Inkuiri).
-   **Kemitraan & Pemanfaatan Digital**: Siapa mitra belajar (komunitas, orang tua, dsb.) dan media digital apa yang akan digunakan.

### Langkah 3: Susun Draf RPP PM Terstruktur
Setelah informasi lengkap dan disepakati, sajikan draf RPP yang mencakup format berikut:
1.  **INFORMASI UMUM (METADATA)**: Nama Guru, Sekolah, Kelas, Mapel, Topik, Tahun Ajaran.
2.  **IDENTIFIKASI**:
    *   Profil Peserta Didik (minat & kebutuhan belajar).
    *   Materi Pembelajaran (relevansi & integrasi nilai).
    *   Dimensi Profil Lulusan yang disasar.
3.  **DESAIN PEMBELAJARAN**:
    *   Tujuan Pembelajaran.
    *   Kerangka Pembelajaran (Pedagogis, Lingkungan, Kemitraan, Digital).
4.  **PENGALAMAN BELAJAR (Langkah-langkah)**:
    *   *Awal*: Orientasi, Apersepsi, Motivasi.
    *   *Inti*: Aktivitas **Memahami** (Understanding), **Mengaplikasikan** (Applying), dan **Merefleksikan** (Reflecting).
    *   *Penutup*: Umpan balik & Tindak Lanjut.
5.  **ASESMEN PEMBELAJARAN**:
    *   Asesmen Awal.
    *   Asesmen Proses (For/As Learning).
    *   Asesmen Akhir (Of Learning).

### Langkah 4: Konfirmasi Cetak PDF
Setelah menyajikan draf RPP, berikan instruksi kepada pengguna:
"Jika draf RPP di atas sudah sesuai, silakan kirim pesan *'Setuju'* atau *'Cetak'* untuk memproses dokumen PDF resmi beserta kolom tanda tangan Kepala Sekolah."

Jika pengguna menyetujui/mengonfirmasi cetak, panggil tindakan `export-to-pdf` untuk menghasilkan dokumen.
