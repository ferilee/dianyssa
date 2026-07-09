import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { getDb, schema } from "../server/db/index.js";
import crypto from "node:crypto";

export default defineAction({
  description: "Menyimpan draf RPP baru yang telah disepakati ke dalam database dan menghasilkan ID RPP.",
  schema: z.object({
    teacherName: z.string().describe("Nama Guru Mata Pelajaran"),
    headmasterName: z.string().describe("Nama Kepala Sekolah"),
    schoolName: z.string().describe("Nama Sekolah"),
    academicYear: z.string().describe("Tahun Ajaran (contoh: 2026/2027)"),
    subject: z.string().describe("Mata pelajaran (contoh: Matematika, IPA)"),
    grade: z.string().describe("Kelas (contoh: Kelas 4, Kelas 7)"),
    topic: z.string().describe("Topik pembahasan (contoh: Pecahan, Fotosintesis)"),
    content: z.string().describe("Konten RPP lengkap hasil diskusi dalam format Markdown / teks terstruktur"),
  }),
  run: async (args, ctx) => {
    const db = getDb();
    const rppId = crypto.randomUUID();

    // Resolusi ID Telegram Pengirim dari email konteks user
    const telegramUserId = ctx?.userEmail?.split("@")[0] || "unknown";

    await db.insert(schema.rppDocuments).values({
      id: rppId,
      telegramUserId,
      teacherName: args.teacherName,
      headmasterName: args.headmasterName,
      schoolName: args.schoolName,
      academicYear: args.academicYear,
      subject: args.subject,
      grade: args.grade,
      topic: args.topic,
      content: args.content,
      pdfPath: "", // Akan diisi oleh aksi export-to-pdf setelah file berhasil dibuat
      createdAt: Date.now(),
    });

    return {
      status: "success",
      rppId,
      message: `Draf RPP untuk ${args.subject} ${args.grade} berhasil disimpan di database dengan ID: ${rppId}. Silakan panggil aksi 'export-to-pdf' dengan rppId ini untuk mencetak PDF resmi.`,
    };
  },
});
