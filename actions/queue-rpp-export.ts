import crypto from "node:crypto";
import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../server/db/index.js";
import { assertRppAccess, requireAuthorizedActor } from "../server/auth/authorization.js";

export default defineAction({
  description: "Mengantrikan ekspor RPP yang telah disetujui agar dirender dan dikirim di latar belakang.",
  schema: z.object({ rppId: z.string().uuid(), format: z.enum(["docx", "pdf"]).default("docx") }),
  run: async ({ rppId, format }, context) => {
    const actor = await requireAuthorizedActor(context);
    const db = getDb();
    const [document] = await db.select().from(schema.rppDocuments).where(eq(schema.rppDocuments.id, rppId)).limit(1);
    if (!document) throw new Error("RPP tidak ditemukan.");
    assertRppAccess(actor, document.telegramUserId);
    if (document.status !== "approved") throw new Error("RPP harus disetujui sebelum diekspor.");
    const now = Date.now();
    const jobId = crypto.randomUUID();
    await db.insert(schema.rppExportJobs).values({ id: jobId, rppDocumentId: rppId, format, status: "queued", attempts: 0, error: null, createdAt: now, updatedAt: now });
    return { status: "queued", jobId, format };
  },
});
