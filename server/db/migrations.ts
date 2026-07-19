import { runMigrations } from "@agent-native/core/db";

/**
 * Skema migrasi SQLite untuk rpp-bot-app.
 *
 * Setiap entri berisi satu atau beberapa pernyataan DDL yang dijalankan
 * secara berurutan oleh `runMigrations` dari `@agent-native/core/db`
 * (saat aplikasi boot) atau oleh `scripts/run-migration.ts` (saat deploy
 * manual). Tabel bookkeeping `rpp_bot_migrations` mencatat versi yang
 * sudah diterapkan agar migrasi bersifat idempotent.
 *
 * Saat menambah tabel baru:
 *   1. Tambahkan entri baru dengan `version` berikutnya di akhir array.
 *   2. Gunakan `CREATE TABLE IF NOT EXISTS` agar aman dijalankan ulang.
 *   3. Jangan pernah mengubah/menghapus entri yang sudah di-merge ke main.
 */
type RppBotMigration = Parameters<typeof runMigrations>[0][number];

export const rppBotMigrations: Array<RppBotMigration> = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS authorized_users (
        telegram_user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rpp_documents (
        id TEXT PRIMARY KEY,
        telegram_user_id TEXT NOT NULL,
        teacher_name TEXT NOT NULL,
        headmaster_name TEXT NOT NULL,
        school_name TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        subject TEXT NOT NULL,
        grade TEXT NOT NULL,
        topic TEXT NOT NULL,
        content TEXT NOT NULL,
        pdf_path TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS web_sessions (
        token TEXT PRIMARY KEY,
        telegram_user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_rpp_documents_user ON rpp_documents (telegram_user_id);
    `,
  },
  {
    version: 2,
    sql: `
      CREATE TABLE IF NOT EXISTS ide_tech_sessions (
        id TEXT PRIMARY KEY,
        telegram_user_id TEXT NOT NULL UNIQUE,
        ide_tech_user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        session_token TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
      );
    `,
  },
  {
    version: 3,
    sql: `
      CREATE TABLE IF NOT EXISTS web_portal_sessions (
        id TEXT PRIMARY KEY,
        session_token_hash TEXT NOT NULL UNIQUE,
        telegram_user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        revoked_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_web_portal_sessions_token
        ON web_portal_sessions (session_token_hash);
      CREATE INDEX IF NOT EXISTS idx_web_portal_sessions_user
        ON web_portal_sessions (telegram_user_id);
    `,
  },
  {
    version: 4,
    sql: `
      ALTER TABLE rpp_documents ADD COLUMN content_json TEXT;
      ALTER TABLE rpp_documents ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
      ALTER TABLE rpp_documents ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE rpp_documents ADD COLUMN approved_at INTEGER;
      CREATE INDEX IF NOT EXISTS idx_rpp_documents_status ON rpp_documents (status);
    `,
  },
  {
    version: 5,
    sql: `
      CREATE TABLE IF NOT EXISTS rpp_artifacts (
        id TEXT PRIMARY KEY,
        rpp_document_id TEXT NOT NULL,
        format TEXT NOT NULL,
        storage_key TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        checksum TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_rpp_artifacts_document ON rpp_artifacts (rpp_document_id);
    `,
  },
  {
    version: 6,
    sql: `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_rpp_artifacts_document_format
        ON rpp_artifacts (rpp_document_id, format);
    `,
  },
  {
    version: 7,
    sql: `
      CREATE TABLE IF NOT EXISTS rpp_export_jobs (
        id TEXT PRIMARY KEY,
        rpp_document_id TEXT NOT NULL,
        format TEXT NOT NULL,
        status TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        error TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_rpp_export_jobs_status ON rpp_export_jobs (status, created_at);
    `,
  },
];

export const RPP_BOT_MIGRATIONS_TABLE = "rpp_bot_migrations";
