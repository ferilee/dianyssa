import type { Client } from "@libsql/client";
import type { ExportJobRepository } from "./export-job-repository.js";

export const createLibsqlExportJobRepository = (db: Client): ExportJobRepository => ({
  async recoverExpiredLeases(now) { const r = await db.execute({ sql: "UPDATE rpp_export_jobs SET status='queued', lease_expires_at=NULL, next_attempt_at=?, updated_at=? WHERE status='processing' AND lease_expires_at<=?", args: [now, now, now] }); return r.rowsAffected; },
  async claimNext(now, leaseMs) { const r = await db.execute({ sql: "UPDATE rpp_export_jobs SET status='processing', attempts=attempts+1, started_at=?, lease_expires_at=?, updated_at=? WHERE id=(SELECT id FROM rpp_export_jobs WHERE status='queued' AND next_attempt_at<=? ORDER BY created_at LIMIT 1) AND status='queued' RETURNING id, rpp_document_id, organization_id, format, attempts", args: [now, now + leaseMs, now, now] }); return r.rows[0] ? { id: String(r.rows[0].id), rppDocumentId: String(r.rows[0].rpp_document_id), organizationId: String(r.rows[0].organization_id), format: String(r.rows[0].format), attempts: Number(r.rows[0].attempts) } : null; },
  async findDocument(id) { const r = await db.execute({ sql: "SELECT id, telegram_user_id, organization_id FROM rpp_documents WHERE id=?", args: [id] }); return r.rows[0] ? { id: String(r.rows[0].id), telegramUserId: String(r.rows[0].telegram_user_id), organizationId: String(r.rows[0].organization_id) } : null; },
  async complete(id, now) { await db.execute({ sql: "UPDATE rpp_export_jobs SET status='completed', error=NULL, lease_expires_at=NULL, completed_at=?, updated_at=? WHERE id=?", args: [now, now, id] }); },
  async retry(id, attempts, error, retryAt, now) { await db.execute({ sql: "UPDATE rpp_export_jobs SET status=?, error=?, lease_expires_at=NULL, next_attempt_at=?, updated_at=? WHERE id=?", args: [attempts >= 3 ? "failed" : "queued", error, retryAt, now, id] }); },
});
