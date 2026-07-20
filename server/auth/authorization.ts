import { eq } from "drizzle-orm";
import type { ActionRunContext } from "@agent-native/core/action";
import { getDb, schema } from "../db/index.js";
import { requireTelegramUserId } from "./telegram-identity.js";

export type AuthorizedActor = {
  telegramUserId: string;
  role: string;
  organizationId: string;
};

export async function requireAuthorizedActor(
  context: Pick<ActionRunContext, "userEmail"> | undefined,
): Promise<AuthorizedActor> {
  const telegramUserId = requireTelegramUserId(context);
  const db = getDb();
  const [user] = await db
    .select({
      telegramUserId: schema.authorizedUsers.telegramUserId,
      role: schema.authorizedUsers.role,
      organizationId: schema.authorizedUsers.organizationId,
    })
    .from(schema.authorizedUsers)
    .where(eq(schema.authorizedUsers.telegramUserId, telegramUserId))
    .limit(1);

  if (!user) {
    throw new Error("You are not authorized to use this action.");
  }

  return user;
}

export function assertRppAccess(
  actor: AuthorizedActor,
  documentOwnerTelegramUserId: string,
  documentOrganizationId: string,
): void {
  if (actor.organizationId !== documentOrganizationId) throw new Error("You are not authorized to access this RPP.");
  if (actor.role === "admin" || actor.telegramUserId === documentOwnerTelegramUserId) {
    return;
  }

  throw new Error("You are not authorized to access this RPP.");
}
