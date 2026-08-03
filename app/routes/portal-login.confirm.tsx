import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { consumeMagicLinkToken, createWebSession, sessionCookie } from "../../server/auth/web-session.js";

export async function loader({ request }: LoaderFunctionArgs) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return { error: "Token login tidak ditemukan. Harap dapatkan link login baru dari Telegram Bot." };
  }

  const telegramUserId = await consumeMagicLinkToken(token);
  if (!telegramUserId) {
    return { error: "Link login tidak valid, kadaluarsa, atau sudah pernah digunakan." };
  }

  const sessionToken = await createWebSession(telegramUserId);
  return redirect("/dashboard", {
    headers: { "Set-Cookie": sessionCookie(sessionToken) },
  });
}

export default function PortalLoginConfirmRoute({ loaderData }: { loaderData?: { error?: string } }) {
  if (!loaderData?.error) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-zinc-950 text-zinc-100">
      <p className="max-w-md rounded-xl border border-red-900 bg-red-950/50 p-4 text-center text-sm text-red-300">
        {loaderData.error}
      </p>
    </div>
  );
}
