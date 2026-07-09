import "../db/index.js";
import {
  ensureAdditiveColumns,
  getDbExec,
  runMigrations,
} from "@agent-native/core/db";

import * as schema from "../db/schema.js";

function isDrizzleTable(value: unknown): value is object {
  return (
    !!value &&
    typeof value === "object" &&
    Object.getOwnPropertySymbols(value).some((s) =>
      s.toString().includes("drizzle"),
    )
  );
}

const schemaTables = Object.values(schema).filter(isDrizzleTable);

const runRppBotMigrations = runMigrations(
  [
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
  ],
  { table: "rpp_bot_migrations" },
);

export default async (nitroApp: any): Promise<void> => {
  await runRppBotMigrations(nitroApp);
  try {
    const summary = await ensureAdditiveColumns({
      db: getDbExec(),
      tables: schemaTables,
    });
    if (summary.errors.length > 0) {
      console.warn(
        "[db] ensureAdditiveColumns completed with errors:",
        summary.errors,
      );
    }
  } catch (err) {
    console.warn(
      "[db] ensureAdditiveColumns failed (non-fatal):",
      err instanceof Error ? err.message : err,
    );
  }
};
