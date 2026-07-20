import { table, text, integer } from "@agent-native/core/db/schema";

// 1. Tabel Whitelist Guru (Akses Kontrol)
export const authorizedUsers = table("authorized_users", {
  telegramUserId: text("telegram_user_id").primaryKey(), // ID unik user Telegram
  name: text("name").notNull(),                          // Nama lengkap guru
  role: text("role").default("user").notNull(),          // 'admin' atau 'user'
  createdAt: integer("created_at").notNull(),
});

// Tenant tingkat pertama. Data lama ditempatkan pada organisasi `default`
// oleh migrasi; pemindahan scope RPP dilakukan bertahap agar tidak memutus akses.
export const organizations = table("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: integer("created_at").notNull(),
});

export const organizationMemberships = table("organization_memberships", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  telegramUserId: text("telegram_user_id").notNull(),
  role: text("role").notNull(),
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
  contentJson: text("content_json"),
  status: text("status").notNull().default("draft"),
  version: integer("version").notNull().default(1),
  approvedAt: integer("approved_at"),
  pdfPath: text("pdf_path").notNull(),                  // Path file PDF di VPS untuk diunduh ulang
  createdAt: integer("created_at").notNull(),
});

export const rppArtifacts = table("rpp_artifacts", {
  id: text("id").primaryKey(),
  rppDocumentId: text("rpp_document_id").notNull(),
  format: text("format").notNull(),
  storageKey: text("storage_key").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  checksum: text("checksum").notNull(),
  status: text("status").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const rppExportJobs = table("rpp_export_jobs", {
  id: text("id").primaryKey(),
  rppDocumentId: text("rpp_document_id").notNull(),
  format: text("format").notNull(),
  status: text("status").notNull(),
  attempts: integer("attempts").notNull().default(0),
  error: text("error"),
  nextAttemptAt: integer("next_attempt_at").notNull(),
  leaseExpiresAt: integer("lease_expires_at"),
  startedAt: integer("started_at"),
  completedAt: integer("completed_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// 3. Identitas dokumen per sekolah. Dipakai saat ekspor agar kop dan
// penandatanganan tidak bergantung pada nilai hard-coded di renderer.
export const schoolDocumentTemplates = table("school_document_templates", {
  schoolName: text("school_name").primaryKey(),
  letterheadText: text("letterhead_text"),
  city: text("city").notNull().default("Jakarta"),
  headmasterNip: text("headmaster_nip"),
  teacherNip: text("teacher_nip"),
  updatedAt: integer("updated_at").notNull(),
});

// 4. Tabel Sesi Token Web UI (Magic Link)
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
