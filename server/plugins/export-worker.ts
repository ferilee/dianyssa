import { exportWorkerHealth } from "../operations/export-worker-health.js";
import { telegramOwnerEmail } from "../auth/telegram-identity.js";
import { createDrizzleExportJobRepository } from "../../services/drizzle-export-job-repository.js";
import type { ExportJobRepository } from "../../services/export-job-repository.js";

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

export type ExportJobExecutor = (input: { format: string; rppId: string; telegramUserId: string }) => Promise<void>;

const productionExecutor: ExportJobExecutor = async ({ format, rppId, telegramUserId }) => {
  const action = (await import(`../../actions/export-to-${format}.js`)).default;
  await action.run({ rppId }, { userEmail: telegramOwnerEmail(telegramUserId), caller: "tool" });
};

export async function processNextJob(executeExport: ExportJobExecutor = productionExecutor, repository: ExportJobRepository = createDrizzleExportJobRepository()) {
  exportWorkerHealth.recordTick();
  if (processing) return;
  processing = true;
  try {
    const now = Date.now();
    const recovered = await repository.recoverExpiredLeases(now);
    if (recovered) logJob("lease_recovered", { count: recovered });
    const job = await repository.claimNext(now, LEASE_MS);
    if (!job) return;
    exportWorkerHealth.recordJobStarted(now);
    logJob("job_started", { jobId: job.id, rppDocumentId: job.rppDocumentId, format: job.format, attempt: job.attempts });
    const document = await repository.findDocument(job.rppDocumentId);
    if (!document) {
      await repository.retry(job.id, 3, "RPP not found", now, now);
      exportWorkerHealth.recordJobFailed();
      logJob("job_failed", { jobId: job.id, reason: "rpp_not_found", attempt: job.attempts });
      return;
    }
    try {
      await executeExport({ format: job.format, rppId: job.rppDocumentId, telegramUserId: document.telegramUserId });
      const completedAt = Date.now();
      await repository.complete(job.id, completedAt);
      exportWorkerHealth.recordJobCompleted(completedAt);
      logJob("job_completed", { jobId: job.id, format: job.format, attempt: job.attempts, renderLatencyMs: completedAt - now });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const failed = job.attempts >= MAX_ATTEMPTS;
      const retryAt = Date.now() + retryDelayMs(job.attempts);
      await repository.retry(job.id, job.attempts, message, retryAt, Date.now());
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
