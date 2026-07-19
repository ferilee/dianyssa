import { describe, expect, it } from "bun:test";
import {
  requireTelegramUserId,
  telegramOwnerEmail,
} from "../server/auth/telegram-identity";

describe("Telegram action identity", () => {
  it("creates and resolves the authenticated Telegram owner identity", () => {
    const owner = telegramOwnerEmail("123456789");

    expect(owner).toBe("123456789@telegram.rppbot");
    expect(requireTelegramUserId({ userEmail: owner })).toBe("123456789");
  });

  it("rejects missing, malformed, and non-Telegram identities", () => {
    expect(() => requireTelegramUserId(undefined)).toThrow();
    expect(() => requireTelegramUserId({ userEmail: "teacher@example.com" })).toThrow();
    expect(() => telegramOwnerEmail("teacher-1")).toThrow();
  });
});
