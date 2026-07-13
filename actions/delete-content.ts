import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { createIdeTechClient } from "../lib/idetech-client";
import { IDETECH_ENDPOINTS } from "../lib/idetech-config";
import { resolveIdeTechSession } from "../lib/resolve-session";

export default defineAction({
  description: "Hapus artikel blog atau pengumuman global dari IdeTech berdasarkan ID.",
  schema: z.object({
    contentType: z.enum(["blog", "announcement"]),
    id: z.string(),
  }),
  run: async ({ contentType, id }, ctx) => {
    const telegramUserId = ctx?.userEmail ?? "unknown";
    const session = await resolveIdeTechSession(telegramUserId);
    const client = createIdeTechClient(session.sessionToken);

    if (contentType === "announcement") {
      await client.delete(IDETECH_ENDPOINTS.announcements.delete(id));
      return {
        status: "success",
        contentType,
        id,
        message: "Pengumuman berhasil dihapus.",
      };
    }

    await client.delete(IDETECH_ENDPOINTS.blogs.delete(id));
    return {
      status: "success",
      contentType,
      id,
      message: "Artikel berhasil dihapus.",
    };
  },
});