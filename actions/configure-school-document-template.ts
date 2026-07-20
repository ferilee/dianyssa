import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { getDb, schema } from "../server/db/index.js";
import { requireAuthorizedActor } from "../server/auth/authorization.js";
import { normalizeSchoolDocumentTemplate } from "../services/school-document-template.js";

const optionalText = z.string().trim().max(500).optional();

export default defineAction({
  description: "Mengatur identitas resmi dokumen untuk satu sekolah: kop surat, kota tanda tangan, serta NIP guru dan kepala sekolah. Hanya admin.",
  schema: z.object({
    schoolName: z.string().trim().min(2).max(250),
    letterheadText: optionalText,
    city: z.string().trim().min(2).max(100).default("Jakarta"),
    headmasterNip: optionalText,
    teacherNip: optionalText,
  }),
  run: async (args, context) => {
    const actor = await requireAuthorizedActor(context);
    if (actor.role !== "admin") throw new Error("Only administrators can configure school document templates.");

    const template = normalizeSchoolDocumentTemplate(args);
    const now = Date.now();
    await getDb()
      .insert(schema.schoolDocumentTemplates)
      .values({ schoolName: args.schoolName, ...template, updatedAt: now })
      .onConflictDoUpdate({
        target: schema.schoolDocumentTemplates.schoolName,
        set: { ...template, updatedAt: now },
      });

    return {
      status: "success",
      schoolName: args.schoolName,
      template,
      message: `Template dokumen untuk ${args.schoolName} berhasil diperbarui.`,
    };
  },
});
