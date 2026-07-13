import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { createIdeTechClient } from "../lib/idetech-client";
import { IDETECH_ENDPOINTS } from "../lib/idetech-config";
import { resolveIdeTechSession } from "../lib/resolve-session";

export default defineAction({
  description: "Daftar artikel blog atau pengumuman global di IdeTech. Menampilkan konten terbaru dengan filter status.",
  schema: z.object({
    contentType: z.enum(["blog", "announcement"]),
    status: z.enum(["all", "draft", "published", "active", "inactive"]).optional(),
    limit: z.number().max(20).default(10),
  }),
  run: async ({ contentType, status, limit }, ctx) => {
    const telegramUserId = ctx?.userEmail ?? "unknown";
    const session = await resolveIdeTechSession(telegramUserId);
    const client = createIdeTechClient(session.sessionToken);

    if (contentType === "announcement") {
      const result = (await client.get(IDETECH_ENDPOINTS.announcements.list)) as {
        announcements: Array<{ id: string; title: string; isActive: boolean; type: string }>;
      };
      let items = result.announcements ?? [];
      if (status && status !== "all") {
        items = items.filter((a) => (status === "active" ? a.isActive : !a.isActive));
      }
      return {
        contentType,
        items: items.slice(0, limit).map((a) => ({
          id: a.id,
          title: a.title,
          status: a.isActive ? "active" : "inactive",
          type: a.type,
        })),
      };
    }

    const result = (await client.get(IDETECH_ENDPOINTS.blogs.list)) as {
      blogs: Array<{ id: string; title: string; status: string; slug: string }>;
    };
    let items = result.blogs ?? [];
    if (status && status !== "all") {
      items = items.filter((b) => b.status === status);
    }
    return {
      contentType,
      items: items.slice(0, limit).map((b) => ({
        id: b.id,
        title: b.title,
        status: b.status,
        slug: b.slug,
      })),
    };
  },
});