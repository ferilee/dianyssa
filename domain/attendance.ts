import crypto from "node:crypto";

export const DEFAULT_ATTENDANCE_DURATION_MINUTES = 15;
export const MAX_ATTENDANCE_DURATION_MINUTES = 180;

export type AttendanceOpenCommand = {
  className: string;
  durationMinutes: number;
};

export function issueAttendanceToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
  };
}

export function hashAttendanceToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function parseAttendanceOpenCommand(rawText: string): AttendanceOpenCommand | null {
  const match = /^\/presensi\s+buka\s+(.+)$/i.exec(rawText.trim());
  if (!match) return null;

  const parts = match[1].trim().split(/\s+/);
  let durationMinutes = DEFAULT_ATTENDANCE_DURATION_MINUTES;
  const last = parts[parts.length - 1];
  if (last && /^\d+$/.test(last)) {
    durationMinutes = Number(last);
    parts.pop();
  }

  const className = parts.join(" ").trim();
  if (
    className.length < 2 ||
    className.length > 80 ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > MAX_ATTENDANCE_DURATION_MINUTES
  ) {
    return null;
  }

  return { className, durationMinutes };
}

export function parseAttendanceStartPayload(rawText: string): string | null {
  const match = /^\/start\s+att_([A-Za-z0-9_-]{32,})$/i.exec(rawText.trim());
  return match?.[1] ?? null;
}

export function isAttendanceSessionOpen(
  session: { expiresAt: number; closedAt: number | null },
  now = Date.now(),
): boolean {
  return session.closedAt === null && session.expiresAt > now;
}
