import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { createIdeTechClient } from "../lib/idetech-client";
import { IDETECH_ENDPOINTS } from "../lib/idetech-config";
import { resolveIdeTechSession } from "../lib/resolve-session";
import { generateSlug } from "../lib/slug";
import { generateExcerpt } from "../lib/excerpt";

const VALID_STATUSES = {
  blog: ["draft", "published"] as const,
  announcement: ["active", "inactive"] as const,
};

export default defineAction({
  description: "Buat atau perbarui artikel blog atau pengumuman global di IdeTech. Gunakan untuk menulis konten baru atau mengedit konten yang sudah ada.",
  schema: z.object({
    contentType: z.enum(["blog", "announcement"]).describe("Jenis konten: blog (artikel) atau announcement (pengumuman)"),
    action: z.enum(["create", "update"]).describe("Tindakan: buat baru atau perbarui yang sudah ada"),
    id: z.string().optional().describe("ID konten (wajib untuk update, opsional untuk create)"),
    title: z.string().min(3).describe("Judul konten (minimal 3 karakter)"),
    content: z.string().min(10).describe("Isi konten (minimal 10 karakter)"),
    type: z.enum(["info", "warning", "success"]).optional().describe("Tipe pengumuman (hanya untuk announcement)"),
    status: z.enum(["draft", "published", "active", "inactive"]).optional().describe("Status konten (default: draft untuk blog, active untuk pengumuman)"),
  }),
  run: async (args, ctx) => {
    const telegramUserId = ctx?.userEmail ?? "unknown";
    const session = await resolveIdeTechSession(telegramUserId);
    const client = createIdeTechClient(session.sessionToken);

    if (args.contentType === "announcement") {
      const body = {
        title: args.title,
        content: args.content,
        type: args.type ?? "info",
        isActive: args.status === "active" || args.status === undefined,
      };

      if (args.action === "create") {
        const result = (await client.post(
          IDETECH_ENDPOINTS.announcements.create(),
          body
        )) as { announcement: { id: string; title: string; isActive: boolean } };
        return {
          status: "success",
          contentType: "announcement",
          id: result.announcement.id,
          title: result.announcement.title,
          isActive: result.announcement.isActive,
          message: `Pengumuman "${result.announcement.title}" berhasil dibuat.`,
        };
      }

      if (!args.id) throw new Error("ID pengumuman wajib diisi untuk update");
      const result = await client.patch(
        IDETECH_ENDPOINTS.announcements.delete(args.id),
        body
      );
      return {
        status: "success",
        contentType: "announcement",
        id: args.id,
        title: (result as any)?.announcement?.title ?? args.title,
        message: `Pengumuman "${args.title}" berhasil diperbarui.`,
      };
    }

    // blog
    const slug = generateSlug(args.title);
    const excerpt = generateExcerpt(args.content);
    const body = {
      title: args.title,
      content: args.content,
      slug,
      excerpt,
      status: args.status ?? "draft",
    };

    if (args.action === "create") {
      const result = (await client.post(
        IDETECH_ENDPOINTS.blogs.create(),
        body
      )) as { blog: { id: string; title: string; slug: string; status: string } };
      return {
        status: "success",
        contentType: "blog",
        id: result.blog.id,
        title: result.blog.title,
        slug: result.blog.slug,
        contentStatus: result.blog.status,
        message: `Artikel "${result.blog.title}" berhasil dibuat sebagai ${result.blog.status}.`,
      };
    }

    if (!args.id) throw new Error("ID artikel wajib diisi untuk update");
    const result = await client.patch(
      IDETECH_ENDPOINTS.blogs.update(args.id),
      { ...body, id: args.id }
    );
    return {
      status: "success",
      contentType: "blog",
      id: args.id,
      title: (result as any)?.blog?.title ?? args.title,
      contentStatus: (result as any)?.blog?.status ?? args.status,
      message: `Artikel "${args.title}" berhasil diperbarui.`,
    };
  },
});