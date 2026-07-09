import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getDb, schema } from "../../server/db/index.js";
import { eq } from "drizzle-orm";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return { error: "Token login tidak ditemukan. Harap dapatkan link login baru dari Telegram Bot." };
  }

  const db = getDb();

  // Cari sesi token di database
  const sessions = await db
    .select()
    .from(schema.webSessions)
    .where(eq(schema.webSessions.token, token))
    .limit(1);

  if (sessions.length === 0) {
    return { error: "Link login tidak valid atau sudah pernah digunakan sebelumnya." };
  }

  const session = sessions[0];

  // Periksa kadaluarsa (1 jam)
  if (session.expiresAt < Date.now()) {
    // Hapus token yang kadaluarsa
    await db.delete(schema.webSessions).where(eq(schema.webSessions.token, token));
    return { error: "Link login telah kadaluarsa. Harap minta link login baru melalui perintah /riwayat di Telegram." };
  }

  // Sukses: Hapus token sekali pakai ini dari database
  await db.delete(schema.webSessions).where(eq(schema.webSessions.token, token));

  // Setel cookie sesi dan redirect ke dashboard
  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": `session=${session.telegramUserId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
    },
  });
}

export default function LoginRoute({ loaderData }: { loaderData?: { error?: string } }) {
  const error = loaderData?.error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-100">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400">
          Autentikasi Portal RPP
        </h1>

        {error ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-950/50 border border-red-900 text-red-300 rounded-xl text-sm">
              {error}
            </div>
            <p className="text-zinc-400 text-sm">
              Silakan kembali ke Telegram Bot dan ketik <code className="px-1.5 py-0.5 bg-zinc-800 text-indigo-300 rounded font-mono">/riwayat</code> untuk mendapatkan link masuk yang baru.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-300">Sedang memproses masuk ke dashboard Anda...</p>
          </div>
        )}
      </div>
    </div>
  );
}
