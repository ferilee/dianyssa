import { table, text, integer } from "@agent-native/core/db/schema";

// 1. Tabel Whitelist Guru (Akses Kontrol)
export const authorizedUsers = table("authorized_users", {
  telegramUserId: text("telegram_user_id").primaryKey(), // ID unik user Telegram
  name: text("name").notNull(),                          // Nama lengkap guru
  role: text("role").default("user").notNull(),          // 'admin' atau 'user'
  createdAt: integer("created_at").notNull(),
});

// 2. Tabel Rencana Pelaksanaan Pembelajaran (RPP)
export const rppDocuments = table("rpp_documents", {
  id: text("id").primaryKey(),
  telegramUserId: text("telegram_user_id").notNull(),   // Pemilik dokumen
  teacherName: text("teacher_name").notNull(),          // Nama Guru Mapel
  headmasterName: text("headmaster_name").notNull(),    // Nama Kepala Sekolah
  schoolName: text("school_name").notNull(),            // Nama Sekolah
  academicYear: text("academic_year").notNull(),        // Tahun Ajaran
  subject: text("subject").notNull(),                   // Mata Pelajaran
  grade: text("grade").notNull(),                       // Kelas
  topic: text("topic").notNull(),                       // Topik RPP
  content: text("content").notNull(),                   // Konten RPP lengkap (JSON / Markdown)
  pdfPath: text("pdf_path").notNull(),                  // Path file PDF di VPS untuk diunduh ulang
  createdAt: integer("created_at").notNull(),
});

// 3. Tabel Sesi Token Web UI (Magic Link)
export const webSessions = table("web_sessions", {
  token: text("token").primaryKey(),                    // Token unik sekali pakai
  telegramUserId: text("telegram_user_id").notNull(),
  expiresAt: integer("expires_at").notNull(),           // Batas kadaluarsa token (misal: +1 jam)
});
