import type { LoaderFunctionArgs } from "react-router";
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../../server/db/index.js";
import { getWebSessionUserId } from "../../server/auth/web-session.js";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const telegramUserId = await getWebSessionUserId(request);
  if (!telegramUserId) throw new Response("Unauthorized", { status: 401 });
  if (!params.id) throw new Response("Bad Request", { status: 400 });
  const db = getDb();
  const [artifact] = await db.select().from(schema.rppArtifacts).where(eq(schema.rppArtifacts.id, params.id)).limit(1);
  if (!artifact) throw new Response("Artifact tidak ditemukan", { status: 404 });
  const [document] = await db.select().from(schema.rppDocuments).where(eq(schema.rppDocuments.id, artifact.rppDocumentId)).limit(1);
  const [user] = await db.select().from(schema.authorizedUsers).where(eq(schema.authorizedUsers.telegramUserId, telegramUserId)).limit(1);
  if (!document || !user || (user.role !== "admin" && document.telegramUserId !== telegramUserId)) throw new Response("Forbidden", { status: 403 });
  const root = path.resolve(process.cwd(), "data");
  const filePath = path.resolve(root, artifact.storageKey);
  if (!filePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(filePath)) throw new Response("Berkas tidak tersedia", { status: 404 });
  const extension = artifact.format === "docx" ? "docx" : "pdf";
  return new Response(fs.readFileSync(filePath), { headers: { "Content-Type": extension === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf", "Content-Disposition": `attachment; filename="RPP.${extension}"` } });
}
