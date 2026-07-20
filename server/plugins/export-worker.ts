import { and, asc, eq, lte } from "drizzle-orm";
import { getDb, schema } from "../db/index.js";
import { telegramOwnerEmail } from "../auth/telegram-identity.js";
import { exportWorkerHealth } from "../operations/export-worker-health.js";

const MAX_ATTEMPTS = 3;
const LEASE_MS = 60_000;
let processing = false;

function logJob(event: string, fields: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ component: "rpp-export-worker", event, at: new Date().toISOString(), ...fields }));
}

async function notifyFailure(chatId: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text: message }) });
}

function retryDelayMs(attempt: number): number {
  return Math.min(60_000, 1_000 * 2 ** Math.max(0, attempt - 1));
}

async function processNextJob() {
  exportWorkerHealth.recordTick();
  if (processing) return;
  processing = true;
  try {
    const db = getDb();
    const now = Date.now();
    const recovered = await db.update(schema.rppExportJobs)
      .set({ status: "queued", leaseExpiresAt: null, error: "Worker lease expired; retrying.", nextAttemptAt: now, updatedAt: now })
      .where(and(eq(schema.rppExportJobs.status, "processing"), lte(schema.rppExportJobs.leaseExpiresAt, now)))
      .returning({ id: schema.rppExportJobs.id });
    if (recovered.length) logJob("lease_recovered", { count: recovered.length });
    const [candidate] = await db.select().from(schema.rppExportJobs)
      .where(and(eq(schema.rppExportJobs.status, "queued"), lte(schema.rppExportJobs.nextAttemptAt, now)))
      .orderBy(asc(schema.rppExportJobs.createdAt)).limit(1);
    if (!candidate) return;
    const [job] = await db.update(schema.rppExportJobs)
      .set({ status: "processing", attempts: candidate.attempts + 1, startedAt: now, leaseExpiresAt: now + LEASE_MS, updatedAt: now })
      .where(and(eq(schema.rppExportJobs.id, candidate.id), eq(schema.rppExportJobs.status, "queued")))
      .returning();
    if (!job) return;
    exportWorkerHealth.recordJobStarted(now);
    logJob("job_started", { jobId: job.id, rppDocumentId: job.rppDocumentId, format: job.format, attempt: job.attempts });
    const [document] = await db.select().from(schema.rppDocuments).where(eq(schema.rppDocuments.id, job.rppDocumentId)).limit(1);
    if (!document) {
      await db.update(schema.rppExportJobs).set({ status: "failed", error: "RPP not found", updatedAt: Date.now() }).where(eq(schema.rppExportJobs.id, job.id));
      exportWorkerHealth.recordJobFailed();
      logJob("job_failed", { jobId: job.id, reason: "rpp_not_found", attempt: job.attempts });
      return;
    }
    try {
      const action = (await import(`../../actions/export-to-${job.format}.js`)).default;
      await action.run({ rppId: job.rppDocumentId }, { userEmail: telegramOwnerEmail(document.telegramUserId), caller: "tool" });
      const completedAt = Date.now();
      await db.update(schema.rppExportJobs).set({ status: "completed", error: null, leaseExpiresAt: null, completedAt, updatedAt: completedAt }).where(eq(schema.rppExportJobs.id, job.id));
      exportWorkerHealth.recordJobCompleted(completedAt);
      logJob("job_completed", { jobId: job.id, format: job.format, attempt: job.attempts, renderLatencyMs: completedAt - now });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const failed = job.attempts >= MAX_ATTEMPTS;
      const retryAt = Date.now() + retryDelayMs(job.attempts);
      await db.update(schema.rppExportJobs).set({ status: failed ? "failed" : "queued", error: message, leaseExpiresAt: null, nextAttemptAt: retryAt, updatedAt: Date.now() }).where(eq(schema.rppExportJobs.id, job.id));
      exportWorkerHealth.recordJobFailed();
      logJob(failed ? "job_failed" : "job_retry_scheduled", { jobId: job.id, format: job.format, attempt: job.attempts, retryAt: failed ? null : retryAt, error: message });
      if (failed) await notifyFailure(document.telegramUserId, "Ekspor RPP gagal setelah beberapa percobaan. Silakan coba lagi atau hubungi administrator.");
    }
  } finally { processing = false; }
}

export default async () => {
  void processNextJob();
  setInterval(() => { void processNextJob(); }, 5_000);
};
