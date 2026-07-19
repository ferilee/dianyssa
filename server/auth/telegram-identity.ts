import type { ActionRunContext } from "@agent-native/core/action";

const TELEGRAM_OWNER_SUFFIX = "@telegram.rppbot";
const TELEGRAM_OWNER_PATTERN = /^(\d+)@telegram\.rppbot$/;

export function telegramOwnerEmail(telegramUserId: string): string {
  if (!/^\d+$/.test(telegramUserId)) {
    throw new Error("Invalid Telegram identity.");
  }

  return `${telegramUserId}${TELEGRAM_OWNER_SUFFIX}`;
}

export function requireTelegramUserId(
  context: Pick<ActionRunContext, "userEmail"> | undefined,
): string {
  const match = context?.userEmail?.match(TELEGRAM_OWNER_PATTERN);
  if (!match) {
    throw new Error("This action is only available to an authenticated Telegram user.");
  }

  return match[1];
}
