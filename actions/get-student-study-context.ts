import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { createIdeTechClient } from "../lib/idetech-client";
import { resolveIdeTechSession } from "../lib/resolve-session";

export default defineAction({
  description: "Mendapatkan konteks belajar siswa aktif (kuis dan materi yang sedang berjalan di IdeTech) untuk membantu membimbing mereka.",
  schema: z.object({
    questId: z.string().optional().describe("ID kuis tertentu yang sedang dihadapi siswa (opsional)"),
  }),
  run: async (args, ctx) => {
    const telegramUserId = ctx?.userEmail ?? "unknown";
    const session = await resolveIdeTechSession(telegramUserId);
    const client = createIdeTechClient(session.sessionToken);

    // Ambil data kuis siswa
    const data = (await client.get("/api/student/quests")) as {
      quests: Array<{
        id: string;
        title: string;
        points: number;
        progress: number;
        mission: string;
        level: number;
        isLocked: boolean;
      }>;
    };

    if (args.questId) {
      const activeQuest = data.quests.find((q) => q.id === args.questId);
      if (!activeQuest) {
        throw new Error(`Kuis dengan ID ${args.questId} tidak ditemukan.`);
      }
      return {
        status: "success",
        activeQuest,
        message: `Konteks kuis "${activeQuest.title}" berhasil diambil.`,
      };
    }

    // Jika tidak ada questId spesifik, cari kuis aktif pertama yang belum selesai (progress < 100) dan tidak terkunci
    const activeQuests = data.quests.filter((q) => q.progress < 100 && !q.isLocked);

    return {
      status: "success",
      activeQuests,
      message: `Berhasil mengambil ${activeQuests.length} kuis aktif yang belum diselesaikan.`,
    };
  },
});
