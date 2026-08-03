import { describe, expect, it } from "bun:test";
import {
  PORTAL_LOGIN_PATH,
  RPP_PORTAL_PUBLIC_PATHS,
  buildPortalLoginUrl,
} from "../server/auth/portal-routes";

describe("portal magic-link routing", () => {
  it("uses a non-reserved portal login URL and exposes only RPP portal routes", () => {
    expect(PORTAL_LOGIN_PATH).toBe("/portal-login");
    expect(buildPortalLoginUrl("https://agent.example.id/", "one-time-token")).toBe(
      "https://agent.example.id/portal-login?token=one-time-token",
    );
    expect(RPP_PORTAL_PUBLIC_PATHS).toEqual([
      "/",
      "/portal-login",
      "/dashboard",
      "/download",
      "/artifacts",
      "/logout",
    ]);
  });
});
