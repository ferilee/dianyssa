import { describe, expect, it } from "bun:test";
import {
  hashAttendanceToken,
  isAttendanceSessionOpen,
  issueAttendanceToken,
  parseAttendanceOpenCommand,
  parseAttendanceStartPayload,
} from "../domain/attendance";

describe("attendance domain", () => {
  it("issues a hashable one-time attendance token", () => {
    const issued = issueAttendanceToken();
    expect(issued.token).toHaveLength(43);
    expect(issued.tokenHash).toBe(hashAttendanceToken(issued.token));
  });

  it("parses an attendance opening command with an optional duration", () => {
    expect(parseAttendanceOpenCommand("/presensi buka XI RPL 20")).toEqual({
      className: "XI RPL",
      durationMinutes: 20,
    });
    expect(parseAttendanceOpenCommand("/presensi buka XI RPL")).toEqual({
      className: "XI RPL",
      durationMinutes: 15,
    });
    expect(parseAttendanceOpenCommand("/presensi buka XI RPL 0")).toBeNull();
  });

  it("accepts only a Telegram deep-link attendance payload", () => {
    const token = issueAttendanceToken().token;
    expect(parseAttendanceStartPayload(`/start att_${token}`)).toBe(token);
    expect(parseAttendanceStartPayload(`/start ${token}`)).toBeNull();
  });

  it("treats closed or expired sessions as unavailable", () => {
    expect(isAttendanceSessionOpen({ expiresAt: 101, closedAt: null }, 100)).toBe(true);
    expect(isAttendanceSessionOpen({ expiresAt: 100, closedAt: null }, 100)).toBe(false);
    expect(isAttendanceSessionOpen({ expiresAt: 101, closedAt: 99 }, 100)).toBe(false);
  });
});
