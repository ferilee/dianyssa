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
    // 1. Siapkan tabel bookkeeping versi migrasi. Skema sengaja
    //    mengikuti yang dibuat oleh `runMigrations` dari
    //    @agent-native/core/db (`version INTEGER PRIMARY KEY`) agar
    //    aplikasi boot (plugin Nitro) dan script ini berbagi tabel
    //    yang sama tanpa konflik kolom.
    await client.execute(
      `CREATE TABLE IF NOT EXISTS ${RPP_BOT_MIGRATIONS_TABLE} (
         version INTEGER PRIMARY KEY
       )`,
    );

    // 2. Ambil versi yang sudah pernah diterapkan.
    const applied = await client.execute(
      `SELECT version FROM ${RPP_BOT_MIGRATIONS_TABLE}`,
    );
    const appliedVersions = new Set(
      applied.rows.map((row) => Number(row.version)),
    );

    // 3. Terapkan migrasi yang belum jalan, urut dari versi terkecil.
    let appliedNow = 0;
    for (const migration of rppBotMigrations) {
      if (appliedVersions.has(migration.version)) {
        console.log(`[skip] v${migration.version} sudah diterapkan`);
        continue;
      }

      const sql = typeof migration.sql === "string" ? migration.sql : "";
      if (!sql) {
        console.warn(
          `[warn] v${migration.version} sql kosong atau bukan string; lewati`,
        );
        continue;
      }

      console.log(`[apply] v${migration.version}…`);
      await client.executeMultiple(sql);
      await client.execute({
        sql: `INSERT INTO ${RPP_BOT_MIGRATIONS_TABLE} (version) VALUES (?)`,
        args: [migration.version],
      });
      appliedNow += 1;
    }

    if (appliedNow === 0) {
      console.log("Tidak ada migrasi baru. Database sudah up-to-date.");
    } else {
      console.log(`Berhasil menerapkan ${appliedNow} migrasi.`);
    }
  } finally {
    client.close();
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[error] migrasi gagal: ${message}`);
  process.exit(1);
});
