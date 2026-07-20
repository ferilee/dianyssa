import { and, asc, eq, lte } from "drizzle-orm";
import { getDb, schema } from "../server/db/index.js";
import type { ExportJobRepository } from "./export-job-repository.js";

export const createDrizzleExportJobRepository = (): ExportJobRepository => ({
  async recoverExpiredLeases(now) {
    const rows = await getDb().update(schema.rppExportJobs).set({ status: "queued", leaseExpiresAt: null, error: "Worker lease expired; retrying.", nextAttemptAt: now, updatedAt: now }).where(and(eq(schema.rppExportJobs.status, "processing"), lte(schema.rppExportJobs.leaseExpiresAt, now))).returning({ id: schema.rppExportJobs.id });
    return rows.length;
  },
  async claimNext(now, leaseMs) {
    const db = getDb();
    const [candidate] = await db.select().from(schema.rppExportJobs).where(and(eq(schema.rppExportJobs.status, "queued"), lte(schema.rppExportJobs.nextAttemptAt, now))).orderBy(asc(schema.rppExportJobs.createdAt)).limit(1);
    if (!candidate) return null;
    const [job] = await db.update(schema.rppExportJobs).set({ status: "processing", attempts: candidate.attempts + 1, startedAt: now, leaseExpiresAt: now + leaseMs, updatedAt: now }).where(and(eq(schema.rppExportJobs.id, candidate.id), eq(schema.rppExportJobs.status, "queued"))).returning();
    return job ?? null;
  },
  async findDocument(id) { const [doc] = await getDb().select({ id: schema.rppDocuments.id, telegramUserId: schema.rppDocuments.telegramUserId, organizationId: schema.rppDocuments.organizationId }).from(schema.rppDocuments).where(eq(schema.rppDocuments.id, id)).limit(1); return doc ?? null; },
  async complete(id, now) { await getDb().update(schema.rppExportJobs).set({ status: "completed", error: null, leaseExpiresAt: null, completedAt: now, updatedAt: now }).where(eq(schema.rppExportJobs.id, id)); },
  async retry(id, attempts, error, retryAt, now) { await getDb().update(schema.rppExportJobs).set({ status: attempts >= 3 ? "failed" : "queued", error, leaseExpiresAt: null, nextAttemptAt: retryAt, updatedAt: now }).where(eq(schema.rppExportJobs.id, id)); },
});
