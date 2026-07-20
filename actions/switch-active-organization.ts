import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { requireAuthorizedActor } from "../server/auth/authorization.js";
import { getDb, schema } from "../server/db/index.js";
import { and, eq } from "drizzle-orm";

export default defineAction({
  description: "Memverifikasi bahwa pengguna adalah anggota organisasi yang dipilih. Perubahan sesi web dilakukan oleh portal setelah verifikasi ini berhasil.",
  schema: z.object({ organizationId: z.string().min(1) }),
  run: async ({ organizationId }, context) => {
    const actor = await requireAuthorizedActor(context);
    const [membership] = await getDb().select().from(schema.organizationMemberships).where(and(eq(schema.organizationMemberships.organizationId, organizationId), eq(schema.organizationMemberships.telegramUserId, actor.telegramUserId))).limit(1);
    if (!membership) throw new Error("You are not a member of this organization.");
    return { status: "success", organizationId, role: membership.role };
  },
});
