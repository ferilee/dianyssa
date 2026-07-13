import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { createIdeTechClient } from "../lib/idetech-client";
import { IDETECH_ENDPOINTS } from "../lib/idetech-config";
import { resolveIdeTechSession } from "../lib/resolve-session";

export default defineAction({
  description: "Ubah status publikasi artikel blog atau pengumuman global. Publikasikan draft, atau nonaktifkan pengumuman.",
  schema: z.object({
    contentType: z.enum(["blog", "announcement"]),
    id: z.string(),
    status: z.enum(["draft", "published", "active", "inactive"]),
  }),
  run: async ({ contentType, id, status }, ctx) => {
    const telegramUserId = ctx?.userEmail ?? "unknown";
    const session = await resolveIdeTechSession(telegramUserId);
    const client = createIdeTechClient(session.sessionToken);

    if (contentType === "announcement") {
      if (status !== "active" && status !== "inactive") {
        throw new Error("Status pengumuman hanya bisa active atau inactive");
      }
      const result = await client.patch(
        IDETECH_ENDPOINTS.announcements.delete(id),
        { isActive: status === "active" }
      );
      return {
        status: "success",
        contentType,
        id,
        newStatus: status,
        message: `Pengumuman "${(result as any).announcement?.title ?? id}" sekarang ${status === "active" ? "aktif" : "nonaktif"}.`,
      };
    }

    if (status !== "draft" && status !== "published") {
      throw new Error("Status artikel hanya bisa draft atau published");
    }
    const result = await client.patch(
      `${IDETECH_ENDPOINTS.blogs.update(id)}`,
      { status }
    );
    return {
      status: "success",
      contentType,
      id,
      newStatus: status,
      message: `Artikel "${(result as any).blog?.title ?? id}" sekarang ${status}.`,
    };
  },
});