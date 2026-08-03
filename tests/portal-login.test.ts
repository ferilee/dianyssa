import { describe, expect, it } from "bun:test";
import {
  PORTAL_LOGIN_PATH,
  RPP_PORTAL_PUBLIC_PATHS,
  buildPortalLoginUrl,
} from "../server/auth/portal-routes";
import { loader as portalLoginLoader } from "../app/routes/portal-login";

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

  it("does not consume a magic token when a link preview performs a GET", async () => {
    const result = await portalLoginLoader({
      request: new Request("https://agent.example.id/portal-login?token=one-time-token"),
    } as never);

    expect(result).toEqual({ token: "one-time-token" });
  });
});
