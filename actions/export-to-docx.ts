import crypto from "node:crypto";
import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "../server/db/index.js";
import { rppDraftSchema } from "../domain/rpp.js";
import { assertRppAccess, requireAuthorizedActor } from "../server/auth/authorization.js";
import { storeArtifact } from "../services/artifact-storage.js";
import { renderRppDocx } from "../services/rpp-docx.js";
import { resolveSchoolDocumentTemplate } from "../services/school-document-template.js";
import { sendTelegramDocument } from "../services/telegram-delivery.js";

export default defineAction({
  description: "Mengekspor RPP yang telah disetujui menjadi dokumen DOCX resmi.",
  schema: z.object({ rppId: z.string().uuid() }),
  run: async ({ rppId }, context) => {
    const actor = await requireAuthorizedActor(context);
    const db = getDb();
    const [document] = await db.select().from(schema.rppDocuments).where(eq(schema.rppDocuments.id, rppId)).limit(1);
    if (!document) throw new Error("RPP tidak ditemukan.");
    assertRppAccess(actor, document.telegramUserId, document.organizationId);
    if (document.status !== "approved") throw new Error("RPP harus disetujui sebelum diekspor.");
    if (!document.contentJson) throw new Error("RPP lama tidak memiliki data terstruktur untuk diekspor ke DOCX.");

    const [existingArtifact] = await db
      .select()
      .from(schema.rppArtifacts)
      .where(and(eq(schema.rppArtifacts.rppDocumentId, document.id), eq(schema.rppArtifacts.format, "docx")))
      .limit(1);
    if (existingArtifact) {
      return {
        status: "success",
        artifactId: existingArtifact.id,
        format: "docx",
        storageKey: existingArtifact.storageKey,
        delivered: existingArtifact.status === "delivered",
        reused: true,
      };
    }

    const draft = rppDraftSchema.parse(JSON.parse(document.contentJson));
    const template = await resolveSchoolDocumentTemplate(document.organizationId, document.schoolName);
    const buffer = await renderRppDocx(draft, template);
    const stored = await storeArtifact(document.id, "docx", buffer);
    const artifactId = crypto.randomUUID();
    await db.insert(schema.rppArtifacts).values({
      id: artifactId,
      rppDocumentId: document.id,
      organizationId: document.organizationId,
      format: "docx",
      storageKey: stored.storageKey,
      sizeBytes: stored.sizeBytes,
      checksum: stored.checksum,
      status: "rendered",
      createdAt: Date.now(),
    });

    let delivered = false;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      const filename = `RPP_${document.subject.replace(/[^a-zA-Z0-9]/g, "_")}_${document.grade.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
      await sendTelegramDocument({ token, chatId: document.telegramUserId, caption: `Berikut dokumen DOCX RPP ${document.subject} ${document.grade}: ${document.topic}`, filename, content: buffer });
      await db.update(schema.rppArtifacts).set({ status: "delivered" }).where(eq(schema.rppArtifacts.id, artifactId));
      delivered = true;
    }

    return { status: "success", artifactId, format: "docx", storageKey: stored.storageKey, delivered, reused: false };
  },
});
