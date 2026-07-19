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
  tokenHash: text("token").primaryKey(),                // Hash token unik sekali pakai
  telegramUserId: text("telegram_user_id").notNull(),
  expiresAt: integer("expires_at").notNull(),           // Batas kadaluarsa token (misal: +1 jam)
});

export const webPortalSessions = table("web_portal_sessions", {
  id: text("id").primaryKey(),
  sessionTokenHash: text("session_token_hash").notNull().unique(),
  telegramUserId: text("telegram_user_id").notNull(),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
  revokedAt: integer("revoked_at"),
});

// 4. Tabel Mapping Telegram User ke Sesi IdeTech
export const ideTechSessions = table("ide_tech_sessions", {
  id: text("id").primaryKey(),
  telegramUserId: text("telegram_user_id").notNull().unique(),
  ideTechUserId: text("ide_tech_user_id").notNull(),
  email: text("email").notNull(),
  sessionToken: text("session_token").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
