import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import crypto from "node:crypto";
import { getDb, schema } from "../server/db/index.js";
import { IDETECH_BASE_URL } from "../lib/idetech-config";
import { requireAuthorizedActor } from "../server/auth/authorization.js";

export default defineAction({
  description: "Menghubungkan akun Telegram pengguna dengan akun IdeTech",
  schema: z.object({
    email: z.string().email().describe("Email akun IdeTech yang akan dihubungkan"),
  }),
  run: async ({ email }, context) => {
    const actor = await requireAuthorizedActor(context);
    const { telegramUserId } = actor;
    const db = getDb();

    const response = await fetch(`${IDETECH_BASE_URL}/api/auth/telegram-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramUserId, email }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || "Gagal menghubungkan akun IdeTech");
    }

    const { user, token } = await response.json();

    await db
      .insert(schema.ideTechSessions)
      .values({
        id: `its_${crypto.randomUUID()}`,
        telegramUserId,
        ideTechUserId: user.id,
        email,
        sessionToken: token,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.ideTechSessions.telegramUserId,
        set: {
          ideTechUserId: user.id,
          email,
          sessionToken: token,
          updatedAt: new Date(),
        },
      });

    return {
      status: "success",
      message: `Akun Telegram berhasil dihubungkan dengan ${email}.`,
      ideTechUserId: user.id,
    };
  },
});
