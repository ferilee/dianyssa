import { and, count, eq, lte } from "drizzle-orm";
import { defineEventHandler, setResponseStatus } from "h3";
import { getDb, schema } from "../db/index.js";
import { exportWorkerHealth } from "../operations/export-worker-health.js";

const WORKER_STALE_AFTER_MS = 20_000;

export default defineEventHandler(async (event) => {
  const now = Date.now();
  try {
    const db = getDb();
    const [failed] = await db.select({ value: count() }).from(schema.rppExportJobs).where(eq(schema.rppExportJobs.status, "failed"));
    const [expiredLeases] = await db.select({ value: count() }).from(schema.rppExportJobs).where(and(
      eq(schema.rppExportJobs.status, "processing"),
      lte(schema.rppExportJobs.leaseExpiresAt, now),
    ));
    const worker = exportWorkerHealth.snapshot();
    const workerHealthy = worker.lastTickAt !== null && now - worker.lastTickAt <= WORKER_STALE_AFTER_MS;
    const healthy = workerHealthy;

    if (!healthy) setResponseStatus(event, 503);
    return {
      status: healthy ? "ok" : "degraded",
      checkedAt: new Date(now).toISOString(),
      database: "ok",
      worker: {
        status: workerHealthy ? "ok" : "stale",
        staleAfterMs: WORKER_STALE_AFTER_MS,
        ...worker,
      },
      jobs: {
        failed: Number(failed?.value ?? 0),
        expiredLeases: Number(expiredLeases?.value ?? 0),
      },
    };
  } catch (error) {
    console.error(JSON.stringify({
      component: "healthz",
      event: "database_check_failed",
      at: new Date(now).toISOString(),
      error: error instanceof Error ? error.message : String(error),
    }));
    setResponseStatus(event, 503);
    return {
      status: "down",
      checkedAt: new Date(now).toISOString(),
      database: "unavailable",
      error: "Database health check failed",
    };
  }
});
