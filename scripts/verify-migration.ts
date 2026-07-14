import "dotenv/config";

import { createClient } from "@libsql/client";

import {
  RPP_BOT_MIGRATIONS_TABLE,
  rppBotMigrations,
} from "../server/db/migrations.js";

const DB_URL = process.env.DATABASE_URL ?? "file:./data/app.db";

async function main() {
  const client = createClient({ url: DB_URL });

  try {
    // 1. Migrasi yang sudah tercatat. Skema tabel bookkeeping mengikuti
    //    yang dibuat oleh `runMigrations` dari @agent-native/core/db:
    //    hanya kolom `version INTEGER PRIMARY KEY`.
    const applied = await client.execute(
      `SELECT version FROM ${RPP_BOT_MIGRATIONS_TABLE} ORDER BY version`,
    );
    console.log(
      `Applied migrations (${applied.rows.length}/${rppBotMigrations.length}):`,
    );
    if (applied.rows.length === 0) {
      console.log("  (belum ada)");
    } else {
      for (const row of applied.rows) {
        console.log(`  v${row.version}`);
      }
    }

    // 2. Tabel yang ada di database.
    const tables = await client.execute(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`,
    );
    console.log(`\nTables (${tables.rows.length}):`);
    for (const row of tables.rows) {
      console.log(`  ${row.name}`);
    }

    // 3. Skema tabel yang didefinisikan oleh migrasi kita, agar mudah
    //    memastikan CREATE TABLE di migration sudah match schema Drizzle.
    const migrationTables = new Set<string>();
    const createTableRe = /CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(\w+)/gi;
    for (const migration of rppBotMigrations) {
      const sql = typeof migration.sql === "string" ? migration.sql : "";
      for (const match of sql.matchAll(createTableRe)) {
        if (match[1]) migrationTables.add(match[1].toLowerCase());
      }
    }

    console.log("\nMigration tables schema:");
    for (const tableName of migrationTables) {
      const info = await client.execute(
        `PRAGMA table_info(${tableName})`,
      );
      console.log(`  ${tableName}:`);
      if (info.rows.length === 0) {
        console.log("    (table belum dibuat — jalankan run-migration.ts)");
        continue;
      }
      for (const col of info.rows) {
        const nullable = col.notnull === 0 ? "NULL" : "NOT NULL";
        const def =
          col.dflt_value !== null ? ` DEFAULT ${col.dflt_value}` : "";
        console.log(
          `    - ${col.name} ${col.type} ${nullable}${def}`,
        );
      }
    }

    // 4. Cek tabel hasil migrasi terbaru secara eksplisit.
    const latestTable = `ide_tech_sessions`;
    const exists = await client.execute({
      sql: `SELECT COUNT(*) AS n FROM ${latestTable}`,
      args: [],
    });
    const rowCount = Number(exists.rows[0]?.n ?? 0);
    console.log(`\n${latestTable} row count: ${rowCount}`);
  } finally {
    client.close();
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[error] verifikasi gagal: ${message}`);
  process.exit(1);
});
