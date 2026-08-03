export const PORTAL_LOGIN_PATH = "/portal-login";
export const PORTAL_LOGIN_CONFIRM_PATH = `${PORTAL_LOGIN_PATH}/confirm`;

// These routes perform their own Telegram portal-session authorization. They
// must bypass Agent-Native's separate Better Auth guard so a Telegram magic
// link can establish the portal session and dashboard actions can use it.
export const RPP_PORTAL_PUBLIC_PATHS = [
  "/",
  PORTAL_LOGIN_PATH,
  "/dashboard",
  "/download",
  "/artifacts",
  "/logout",
] as const;

export function buildPortalLoginUrl(appUrl: string, token: string): string {
  const baseUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
  return `${baseUrl}${PORTAL_LOGIN_PATH}?token=${encodeURIComponent(token)}`;
}
