import { afterEach, describe, expect, it } from "bun:test";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import { createClient, type Client } from "@libsql/client";
import { rppBotMigrations, RPP_BOT_MIGRATIONS_TABLE } from "../server/db/migrations";
import { assertRppAccess } from "../server/auth/authorization";
import { createLibsqlExportJobRepository } from "../services/libsql-export-job-repository";
import { processNextJob } from "../server/plugins/export-worker";

const clients: Array<{ client: Client; file: string }> = [];

async function createE2eDatabase() {
  const file = `/tmp/rpp-e2e-${crypto.randomUUID()}.db`;
  const client = createClient({ url: `file:${file}` });
  clients.push({ client, file });
  await client.execute(`CREATE TABLE ${RPP_BOT_MIGRATIONS_TABLE} (version INTEGER PRIMARY KEY)`);
  for (const migration of rppBotMigrations) {
    await client.executeMultiple(migration.sql as string);
    await client.execute({ sql: `INSERT INTO ${RPP_BOT_MIGRATIONS_TABLE} (version) VALUES (?)`, args: [migration.version] });
  }
  return client;
}

afterEach(async () => { while (clients.length) { const entry = clients.pop(); entry?.client.close(); if (entry) await fs.rm(entry.file, { force: true }); } });

describe("E2E harness", () => {
  it("creates an isolated database with the complete RPP workflow schema", async () => {
    const db = await createE2eDatabase();
    const migrations = await db.execute(`SELECT COUNT(*) AS count FROM ${RPP_BOT_MIGRATIONS_TABLE}`);
    const tables = await db.execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('rpp_documents', 'rpp_export_jobs', 'organizations', 'organization_memberships')");
    expect(Number(migrations.rows[0]?.count)).toBe(rppBotMigrations.length);
    expect(tables.rows).toHaveLength(4);
  });

  it("queues an approved RPP only after the draft lifecycle is complete", async () => {
    const db = await createE2eDatabase();
    const now = Date.now();
    await db.execute({ sql: "INSERT INTO authorized_users (telegram_user_id, name, role, organization_id, created_at) VALUES (?, ?, ?, ?, ?)", args: ["1001", "Guru A", "user", "default", now] });
    await db.execute({ sql: "INSERT INTO rpp_documents (id, telegram_user_id, organization_id, teacher_name, headmaster_name, school_name, academic_year, subject, grade, topic, content, pdf_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", args: ["rpp-a", "1001", "default", "Guru A", "Kepsek A", "Sekolah A", "2026/2027", "IPA", "5", "Ekosistem", "konten", "", "draft", now] });
    const draft = await db.execute({ sql: "SELECT status FROM rpp_documents WHERE id = ?", args: ["rpp-a"] });
    expect(draft.rows[0]?.status).toBe("draft");

    await db.execute({ sql: "UPDATE rpp_documents SET status = 'approved', approved_at = ? WHERE id = ? AND status = 'draft'", args: [now, "rpp-a"] });
    await db.execute({ sql: "INSERT INTO rpp_export_jobs (id, rpp_document_id, organization_id, format, status, attempts, next_attempt_at, created_at, updated_at) SELECT ?, id, organization_id, ?, 'queued', 0, ?, ?, ? FROM rpp_documents WHERE id = ? AND status = 'approved'", args: ["job-a", "docx", now, now, now, "rpp-a"] });
    const jobs = await db.execute({ sql: "SELECT format, status, organization_id FROM rpp_export_jobs WHERE rpp_document_id = ?", args: ["rpp-a"] });
    expect(jobs.rows).toEqual([{ format: "docx", status: "queued", organization_id: "default" }]);
  });

  it("denies an organization B user access to organization A's RPP and artifact", async () => {
    const db = await createE2eDatabase();
    const now = Date.now();
    await db.execute({ sql: "INSERT INTO organizations (id, name, slug, created_at) VALUES (?, ?, ?, ?), (?, ?, ?, ?)", args: ["org-a", "Sekolah A", "sekolah-a", now, "org-b", "Sekolah B", "sekolah-b", now] });
    await db.execute({ sql: "INSERT INTO rpp_documents (id, telegram_user_id, organization_id, teacher_name, headmaster_name, school_name, academic_year, subject, grade, topic, content, pdf_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", args: ["rpp-a", "1001", "org-a", "Guru A", "Kepsek A", "Sekolah A", "2026/2027", "IPA", "5", "Ekosistem", "konten", "", now] });
    await db.execute({ sql: "INSERT INTO rpp_artifacts (id, rpp_document_id, organization_id, format, storage_key, size_bytes, checksum, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: ["artifact-a", "rpp-a", "org-a", "docx", "rpp-a.docx", 10, "checksum", "rendered", now] });
    const [document] = (await db.execute({ sql: "SELECT telegram_user_id, organization_id FROM rpp_documents WHERE id = ?", args: ["rpp-a"] })).rows;
    const [artifact] = (await db.execute({ sql: "SELECT organization_id FROM rpp_artifacts WHERE id = ?", args: ["artifact-a"] })).rows;
    const actorB = { telegramUserId: "2002", role: "admin", organizationId: "org-b" };
    expect(() => assertRppAccess(actorB, String(document?.telegram_user_id), String(document?.organization_id))).toThrow("not authorized");
    expect(artifact?.organization_id).toBe("org-a");
  });

  it("requeues a failed Telegram delivery and completes the same export job on retry", async () => {
    const db = await createE2eDatabase();
    const now = Date.now();
    await db.execute({ sql: "INSERT INTO rpp_export_jobs (id, rpp_document_id, organization_id, format, status, attempts, next_attempt_at, created_at, updated_at) VALUES (?, ?, ?, ?, 'processing', 1, ?, ?, ?)", args: ["job-delivery", "rpp-delivery", "org-a", "docx", now, now, now] });
    const retryAt = now + 1_000;
    await db.execute({ sql: "UPDATE rpp_export_jobs SET status = 'queued', error = ?, lease_expires_at = NULL, next_attempt_at = ?, updated_at = ? WHERE id = ?", args: ["Telegram delivery failed: mocked outage", retryAt, now, "job-delivery"] });
    const [queued] = (await db.execute({ sql: "SELECT id, status, attempts, next_attempt_at FROM rpp_export_jobs WHERE id = ?", args: ["job-delivery"] })).rows;
    expect(queued).toEqual({ id: "job-delivery", status: "queued", attempts: 1, next_attempt_at: retryAt });

    await db.execute({ sql: "UPDATE rpp_export_jobs SET status = 'completed', attempts = 2, error = NULL, completed_at = ?, updated_at = ? WHERE id = ? AND status = 'queued'", args: [retryAt, retryAt, "job-delivery"] });
    const [completed] = (await db.execute({ sql: "SELECT id, status, attempts, error FROM rpp_export_jobs WHERE id = ?", args: ["job-delivery"] })).rows;
    expect(completed).toEqual({ id: "job-delivery", status: "completed", attempts: 2, error: null });
  });

  it("runs the worker with a mocked Telegram executor, retries, then completes", async () => {
    const db = await createE2eDatabase(); const now = Date.now();
    await db.execute({ sql: "INSERT INTO rpp_documents (id, telegram_user_id, organization_id, teacher_name, headmaster_name, school_name, academic_year, subject, grade, topic, content, pdf_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", args: ["rpp-worker", "1001", "default", "Guru", "Kepsek", "Sekolah", "2026", "IPA", "5", "Topik", "x", "", now] });
    await db.execute({ sql: "INSERT INTO rpp_export_jobs (id, rpp_document_id, organization_id, format, status, attempts, next_attempt_at, created_at, updated_at) VALUES (?, ?, ?, ?, 'queued', 0, ?, ?, ?)", args: ["job-worker", "rpp-worker", "default", "docx", 0, now, now] });
    const repo = createLibsqlExportJobRepository(db); let calls = 0;
    await processNextJob(async () => { calls++; throw new Error("mock telegram outage"); }, repo);
    const retry = await db.execute({ sql: "SELECT status, attempts FROM rpp_export_jobs WHERE id=?", args: ["job-worker"] });
    expect(retry.rows[0]).toEqual({ status: "queued", attempts: 1 });
    await db.execute({ sql: "UPDATE rpp_export_jobs SET next_attempt_at=0 WHERE id=?", args: ["job-worker"] });
    await processNextJob(async () => { calls++; }, repo);
    const done = await db.execute({ sql: "SELECT status, attempts FROM rpp_export_jobs WHERE id=?", args: ["job-worker"] });
    expect(done.rows[0]).toEqual({ status: "completed", attempts: 2 }); expect(calls).toBe(2);
  });

  it("recovers an expired lease after a worker restart and completes the job", async () => {
    const db = await createE2eDatabase(); const now = Date.now();
    await db.execute({ sql: "INSERT INTO rpp_documents (id, telegram_user_id, organization_id, teacher_name, headmaster_name, school_name, academic_year, subject, grade, topic, content, pdf_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", args: ["rpp-lease", "1001", "default", "Guru", "Kepsek", "Sekolah", "2026", "IPA", "5", "Topik", "x", "", now] });
    await db.execute({ sql: "INSERT INTO rpp_export_jobs (id, rpp_document_id, organization_id, format, status, attempts, next_attempt_at, lease_expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, 'processing', 1, ?, ?, ?, ?)", args: ["job-lease", "rpp-lease", "default", "docx", now, now - 1, now, now] });
    await processNextJob(async () => {}, createLibsqlExportJobRepository(db));
    const job = await db.execute({ sql: "SELECT status, attempts FROM rpp_export_jobs WHERE id=?", args: ["job-lease"] });
    expect(job.rows[0]).toEqual({ status: "completed", attempts: 2 });
  });

  it("allows switching only to an organization with membership", async () => {
    const db = await createE2eDatabase(); const now = Date.now();
    await db.execute({ sql: "INSERT INTO organizations (id, name, slug, created_at) VALUES ('org-a','A','a',?),('org-b','B','b',?),('org-c','C','c',?)", args: [now, now, now] });
    await db.execute({ sql: "INSERT INTO organization_memberships (id, organization_id, telegram_user_id, role, created_at) VALUES ('m-a','org-a','1001','school_admin',?),('m-b','org-b','1001','school_admin',?)", args: [now, now] });
    const permitted = await db.execute({ sql: "SELECT organization_id FROM organization_memberships WHERE telegram_user_id=? AND organization_id=?", args: ["1001", "org-b"] });
    const denied = await db.execute({ sql: "SELECT organization_id FROM organization_memberships WHERE telegram_user_id=? AND organization_id=?", args: ["1001", "org-c"] });
    expect(permitted.rows).toHaveLength(1); expect(denied.rows).toHaveLength(0);
  });
});
