import crypto from "node:crypto";
import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../server/db/index.js";
import { requireAuthorizedActor } from "../server/auth/authorization.js";
import { organizationSchema } from "../domain/organization.js";

export default defineAction({
  description: "Membuat organisasi/sekolah baru dan menjadikan bootstrap admin sebagai admin sekolahnya.",
  schema: organizationSchema.omit({ id: true }),
  run: async (args, context) => {
    const actor = await requireAuthorizedActor(context);
    if (actor.telegramUserId !== process.env.INITIAL_ADMIN_TELEGRAM_ID) throw new Error("Only the bootstrap platform administrator can create organizations.");
    const db = getDb();
    const id = crypto.randomUUID();
    const now = Date.now();
    await db.insert(schema.organizations).values({ id, ...args, createdAt: now });
    await db.insert(schema.organizationMemberships).values({ id: crypto.randomUUID(), organizationId: id, telegramUserId: actor.telegramUserId, role: "school_admin", createdAt: now });
    await db.update(schema.authorizedUsers).set({ organizationId: id, role: "admin" }).where(eq(schema.authorizedUsers.telegramUserId, actor.telegramUserId));
    return { status: "success", organizationId: id, slug: args.slug, message: `Organisasi ${args.name} siap digunakan.` };
  },
});
