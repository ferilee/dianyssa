import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "../server/db/index.js";
import { assertRppAccess, requireAuthorizedActor } from "../server/auth/authorization.js";

export default defineAction({
  description: "Melihat status ekspor dokumen RPP yang sedang atau telah diproses.",
  schema: z.object({ rppId: z.string().uuid() }),
  run: async ({ rppId }, context) => {
    const actor = await requireAuthorizedActor(context);
    const db = getDb();
    const [document] = await db.select().from(schema.rppDocuments).where(eq(schema.rppDocuments.id, rppId)).limit(1);
    if (!document) throw new Error("RPP tidak ditemukan.");
    assertRppAccess(actor, document.telegramUserId, document.organizationId);
    const [job] = await db.select().from(schema.rppExportJobs).where(eq(schema.rppExportJobs.rppDocumentId, rppId)).orderBy(desc(schema.rppExportJobs.createdAt)).limit(1);
    return job ?? { status: "not_requested" };
  },
});
