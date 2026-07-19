import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "../db/index.js";
import { telegramOwnerEmail } from "../auth/telegram-identity.js";

const MAX_ATTEMPTS = 3;
let processing = false;

async function processNextJob() {
  if (processing) return;
  processing = true;
  try {
    const db = getDb();
    const [job] = await db.select().from(schema.rppExportJobs).where(eq(schema.rppExportJobs.status, "queued")).orderBy(asc(schema.rppExportJobs.createdAt)).limit(1);
    if (!job) return;
    const [document] = await db.select().from(schema.rppDocuments).where(eq(schema.rppDocuments.id, job.rppDocumentId)).limit(1);
    if (!document) {
      await db.update(schema.rppExportJobs).set({ status: "failed", error: "RPP not found", updatedAt: Date.now() }).where(eq(schema.rppExportJobs.id, job.id));
      return;
    }
    await db.update(schema.rppExportJobs).set({ status: "processing", attempts: job.attempts + 1, updatedAt: Date.now() }).where(eq(schema.rppExportJobs.id, job.id));
    try {
      const action = (await import(`../../actions/export-to-${job.format}.js`)).default;
      await action.run({ rppId: job.rppDocumentId }, { userEmail: telegramOwnerEmail(document.telegramUserId), caller: "tool" });
      await db.update(schema.rppExportJobs).set({ status: "completed", error: null, updatedAt: Date.now() }).where(eq(schema.rppExportJobs.id, job.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await db.update(schema.rppExportJobs).set({ status: job.attempts + 1 >= MAX_ATTEMPTS ? "failed" : "queued", error: message, updatedAt: Date.now() }).where(eq(schema.rppExportJobs.id, job.id));
    }
  } finally { processing = false; }
}

export default async () => {
  void processNextJob();
  setInterval(() => { void processNextJob(); }, 5_000);
};
