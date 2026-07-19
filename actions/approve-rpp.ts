import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "../server/db/index.js";
import { assertRppAccess, requireAuthorizedActor } from "../server/auth/authorization.js";

export default defineAction({
  description: "Mengunci satu versi draf RPP yang sudah disetujui guru sebelum diekspor.",
  schema: z.object({ rppId: z.string().uuid() }),
  run: async ({ rppId }, context) => {
    const actor = await requireAuthorizedActor(context);
    const db = getDb();
    const [document] = await db
      .select()
      .from(schema.rppDocuments)
      .where(eq(schema.rppDocuments.id, rppId))
      .limit(1);

    if (!document) throw new Error("RPP tidak ditemukan.");
    assertRppAccess(actor, document.telegramUserId);
    if (document.status !== "draft") {
      throw new Error("Hanya RPP berstatus draft yang dapat disetujui.");
    }

    const [approved] = await db
      .update(schema.rppDocuments)
      .set({ status: "approved", approvedAt: Date.now() })
      .where(and(eq(schema.rppDocuments.id, rppId), eq(schema.rppDocuments.status, "draft")))
      .returning({ id: schema.rppDocuments.id, version: schema.rppDocuments.version });

    if (!approved) throw new Error("RPP tidak dapat disetujui. Coba lagi.");
    return { status: "success", rppId: approved.id, version: approved.version };
  },
});
