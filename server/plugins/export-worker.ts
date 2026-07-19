import { and, asc, eq, lte } from "drizzle-orm";
import { getDb, schema } from "../db/index.js";
import { telegramOwnerEmail } from "../auth/telegram-identity.js";

const MAX_ATTEMPTS = 3;
const LEASE_MS = 60_000;
let processing = false;

function retryDelayMs(attempt: number): number {
  return Math.min(60_000, 1_000 * 2 ** Math.max(0, attempt - 1));
}

async function processNextJob() {
  if (processing) return;
  processing = true;
  try {
    const db = getDb();
    const now = Date.now();
    await db.update(schema.rppExportJobs)
      .set({ status: "queued", leaseExpiresAt: null, error: "Worker lease expired; retrying.", nextAttemptAt: now, updatedAt: now })
      .where(and(eq(schema.rppExportJobs.status, "processing"), lte(schema.rppExportJobs.leaseExpiresAt, now)));
    const [candidate] = await db.select().from(schema.rppExportJobs)
      .where(and(eq(schema.rppExportJobs.status, "queued"), lte(schema.rppExportJobs.nextAttemptAt, now)))
      .orderBy(asc(schema.rppExportJobs.createdAt)).limit(1);
    if (!candidate) return;
    const [job] = await db.update(schema.rppExportJobs)
      .set({ status: "processing", attempts: candidate.attempts + 1, startedAt: now, leaseExpiresAt: now + LEASE_MS, updatedAt: now })
      .where(and(eq(schema.rppExportJobs.id, candidate.id), eq(schema.rppExportJobs.status, "queued")))
      .returning();
    if (!job) return;
    const [document] = await db.select().from(schema.rppDocuments).where(eq(schema.rppDocuments.id, job.rppDocumentId)).limit(1);
    if (!document) {
      await db.update(schema.rppExportJobs).set({ status: "failed", error: "RPP not found", updatedAt: Date.now() }).where(eq(schema.rppExportJobs.id, job.id));
      return;
    }
    try {
      const action = (await import(`../../actions/export-to-${job.format}.js`)).default;
      await action.run({ rppId: job.rppDocumentId }, { userEmail: telegramOwnerEmail(document.telegramUserId), caller: "tool" });
      await db.update(schema.rppExportJobs).set({ status: "completed", error: null, leaseExpiresAt: null, completedAt: Date.now(), updatedAt: Date.now() }).where(eq(schema.rppExportJobs.id, job.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const failed = job.attempts >= MAX_ATTEMPTS;
      const retryAt = Date.now() + retryDelayMs(job.attempts);
      await db.update(schema.rppExportJobs).set({ status: failed ? "failed" : "queued", error: message, leaseExpiresAt: null, nextAttemptAt: retryAt, updatedAt: Date.now() }).where(eq(schema.rppExportJobs.id, job.id));
    }
  } finally { processing = false; }
}

export default async () => {
  void processNextJob();
  setInterval(() => { void processNextJob(); }, 5_000);
};
