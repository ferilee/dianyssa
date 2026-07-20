import crypto from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb, schema } from "../db/index.js";

const COOKIE_NAME = "rpp_portal_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function newToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function cookieAttributes(maxAge?: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax${secure}${maxAge === undefined ? "" : `; Max-Age=${maxAge}`}`;
}

function readCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get("Cookie")?.split(";") ?? [];
  const prefix = `${name}=`;
  const value = cookies.find((cookie) => cookie.trim().startsWith(prefix));
  return value ? value.trim().slice(prefix.length) : null;
}

export function issueMagicLinkToken(): { token: string; tokenHash: string } {
  const token = newToken();
  return { token, tokenHash: hashToken(token) };
}

export async function consumeMagicLinkToken(token: string): Promise<string | null> {
  const db = getDb();
  const [magicLink] = await db
    .delete(schema.webSessions)
    .where(
      and(
        eq(schema.webSessions.tokenHash, hashToken(token)),
        gt(schema.webSessions.expiresAt, Date.now()),
      ),
    )
    .returning({ telegramUserId: schema.webSessions.telegramUserId });

  return magicLink?.telegramUserId ?? null;
}

export async function createWebSession(telegramUserId: string): Promise<string> {
  const db = getDb();
  const sessionToken = newToken();
  const now = Date.now();

  await db.insert(schema.webPortalSessions).values({
    id: crypto.randomUUID(),
    sessionTokenHash: hashToken(sessionToken),
    telegramUserId,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    revokedAt: null,
  });

  return sessionToken;
}

export async function getWebSessionUserId(request: Request): Promise<string | null> {
  return (await getWebSessionContext(request))?.telegramUserId ?? null;
}

export async function getWebSessionContext(request: Request): Promise<{ telegramUserId: string; activeOrganizationId: string } | null> {
  const sessionToken = readCookie(request, COOKIE_NAME);
  if (!sessionToken) return null;

  const db = getDb();
  const [session] = await db
    .select({ telegramUserId: schema.webPortalSessions.telegramUserId, activeOrganizationId: schema.webPortalSessions.activeOrganizationId })
    .from(schema.webPortalSessions)
    .where(
      and(
        eq(schema.webPortalSessions.sessionTokenHash, hashToken(sessionToken)),
        gt(schema.webPortalSessions.expiresAt, Date.now()),
        isNull(schema.webPortalSessions.revokedAt),
      ),
    )
    .limit(1);

  return session ?? null;
}

export async function revokeWebSession(request: Request): Promise<void> {
  const sessionToken = readCookie(request, COOKIE_NAME);
  if (!sessionToken) return;

  await getDb()
    .update(schema.webPortalSessions)
    .set({ revokedAt: Date.now() })
    .where(eq(schema.webPortalSessions.sessionTokenHash, hashToken(sessionToken)));
}

export async function setActiveOrganization(request: Request, organizationId: string): Promise<void> {
  const sessionToken = readCookie(request, COOKIE_NAME);
  if (!sessionToken) throw new Error("No active web session.");
  const context = await getWebSessionContext(request);
  if (!context) throw new Error("Invalid web session.");
  const [membership] = await getDb().select().from(schema.organizationMemberships).where(and(eq(schema.organizationMemberships.organizationId, organizationId), eq(schema.organizationMemberships.telegramUserId, context.telegramUserId))).limit(1);
  if (!membership) throw new Error("You are not a member of this organization.");
  await getDb().update(schema.webPortalSessions).set({ activeOrganizationId: organizationId }).where(eq(schema.webPortalSessions.sessionTokenHash, hashToken(sessionToken)));
}

export function sessionCookie(sessionToken: string): string {
  return `${COOKIE_NAME}=${sessionToken}; ${cookieAttributes(Math.floor(SESSION_TTL_MS / 1000))}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; ${cookieAttributes(0)}`;
}
