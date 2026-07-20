import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "../server/db/index.js";
import { assertRppAccess, requireAuthorizedActor } from "../server/auth/authorization.js";

export default defineAction({
  description: "Mengantrekan ulang ekspor RPP yang gagal tanpa membuat dokumen baru.",
  schema: z.object({ jobId: z.string().uuid() }),
  run: async ({ jobId }, context) => {
    const actor = await requireAuthorizedActor(context);
    const db = getDb();
    const [job] = await db.select().from(schema.rppExportJobs).where(eq(schema.rppExportJobs.id, jobId)).limit(1);
    if (!job) throw new Error("Job ekspor tidak ditemukan.");
    const [document] = await db.select().from(schema.rppDocuments).where(eq(schema.rppDocuments.id, job.rppDocumentId)).limit(1);
    if (!document) throw new Error("RPP tidak ditemukan.");
    assertRppAccess(actor, document.telegramUserId, document.organizationId);
    if (job.status !== "failed") throw new Error("Hanya job gagal yang dapat dicoba ulang.");
    const now = Date.now();
    await db.update(schema.rppExportJobs).set({ status: "queued", attempts: 0, error: null, nextAttemptAt: now, leaseExpiresAt: null, updatedAt: now }).where(and(eq(schema.rppExportJobs.id, jobId), eq(schema.rppExportJobs.status, "failed")));
    return { status: "queued", jobId };
  },
});
