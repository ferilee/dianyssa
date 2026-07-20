import { defineAction } from "@agent-native/core/action";
import { getDb, schema } from "../server/db/index.js";
import crypto from "node:crypto";
import { resolveIdeTechSession } from "../lib/resolve-session";
import { createIdeTechClient } from "../lib/idetech-client";
import { requireAuthorizedActor } from "../server/auth/authorization.js";
import { rppDraftSchema, rppDraftToMarkdown } from "../domain/rpp.js";

export default defineAction({
  description: "Menyimpan draf RPP baru yang telah disepakati ke dalam database dan menghasilkan ID RPP.",
  schema: rppDraftSchema.describe("Draf RPP Pembelajaran Mendalam terstruktur dan tervalidasi."),
  run: async (args, ctx) => {
    const actor = await requireAuthorizedActor(ctx);
    const db = getDb();
    const rppId = crypto.randomUUID();

    const content = rppDraftToMarkdown(args);
    await db.insert(schema.rppDocuments).values({
      id: rppId,
      telegramUserId: actor.telegramUserId,
      organizationId: actor.organizationId,
      teacherName: args.teacherName,
      headmasterName: args.headmasterName,
      schoolName: args.schoolName,
      academicYear: args.academicYear,
      subject: args.subject,
      grade: args.grade,
      topic: args.topic,
      content,
      contentJson: JSON.stringify(args),
      status: "draft",
      version: 1,
      pdfPath: "", // Akan diisi oleh aksi export-to-pdf setelah file berhasil dibuat
      createdAt: Date.now(),
    });

    let syncMessage = "";
    try {
      const session = await resolveIdeTechSession(actor.telegramUserId);
      if (session && session.sessionToken) {
        const client = createIdeTechClient(session.sessionToken);
        await client.post("/api/teacher/rpps", {
          topic: args.topic,
          grade: args.grade,
          duration: "2 JP",
          model: "Pembelajaran Mendalam",
          content,
          status: "draft",
        });
        syncMessage = " Dan RPP ini berhasil disinkronkan ke akun IdeTech Anda.";
      }
    } catch (e) {
      console.log("Belum terhubung ke IdeTech atau gagal sinkronisasi:", e);
    }

    return {
      status: "success",
      rppId,
      message: `Draf RPP untuk ${args.subject} ${args.grade} berhasil disimpan dengan ID ${rppId} dan status draft.${syncMessage} Tampilkan ringkasannya kepada guru, lalu panggil aksi 'approve-rpp' sebelum mengekspor dokumen.`,
    };
  },
});
