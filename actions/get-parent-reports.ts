import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { createIdeTechClient } from "../lib/idetech-client";
import { resolveIdeTechSession } from "../lib/resolve-session";

export default defineAction({
  description: "Mendapatkan laporan belajar anak-anak bagi akun Orang Tua (Parent) dari IdeTech, termasuk catatan jurnal guru.",
  schema: z.object({
    studentId: z.string().optional().describe("ID Siswa/anak tertentu (opsional, jika kosong akan mengambil semua anak)"),
  }),
  run: async (args, ctx) => {
    const telegramUserId = ctx?.userEmail ?? "unknown";
    const session = await resolveIdeTechSession(telegramUserId);
    const client = createIdeTechClient(session.sessionToken);

    // Ambil data laporan anak dari IdeTech
    const data = (await client.get("/api/parent/reports")) as {
      children: Array<{
        studentId: string;
        studentName: string;
        relationship: string;
        avatarUrl: string | null;
        schoolName: string | null;
        materialProgressRows: any[];
        questProgressRows: any[];
        uniqueJournals: any[];
        progress: number;
        allActivities: any[];
      }>;
    };

    if (args.studentId) {
      const child = data.children.find((c) => c.studentId === args.studentId);
      if (!child) {
        throw new Error(`Anak dengan ID ${args.studentId} tidak ditemukan.`);
      }
      return {
        status: "success",
        child,
        message: `Laporan belajar untuk anak ${child.studentName} berhasil diambil.`,
      };
    }

    return {
      status: "success",
      children: data.children,
      message: `Berhasil mengambil laporan belajar untuk ${data.children.length} anak.`,
    };
  },
});
