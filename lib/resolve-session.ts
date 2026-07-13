import { eq } from "drizzle-orm";
import { getDb, schema } from "../server/db/index.js";

/**
 * Mengambil session token untuk user Telegram yang sudah terhubung ke IdeTech
 * - Melakukan lookup berdasarkan telegramUserId
 * - Melempar error jika belum login
 */

export async function resolveIdeTechSession(telegramUserId: string) {
  const db = getDb();
  const [session] = await db
    .select()
    .from(schema.ideTechSessions)
    .where(eq(schema.ideTechSessions.telegramUserId, telegramUserId))
    .limit(1);

  if (!session) {
    throw new Error(
      "Akun Telegram belum dihubungkan dengan IdeTech. Ketik /hubungkan untuk memulai."
    );
  }

  return session;
}