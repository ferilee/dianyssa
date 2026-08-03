import { Form } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { PORTAL_LOGIN_CONFIRM_PATH } from "../../server/auth/portal-routes.js";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return { error: "Token login tidak ditemukan. Harap dapatkan link login baru dari Telegram Bot." };
  }

  // Do not consume the one-time token in a GET request. Messaging clients and
  // link-preview bots may fetch the URL before the user clicks it.
  return { token };
}

export default function PortalLoginRoute({ loaderData }: { loaderData?: { error?: string; token?: string } }) {
  const error = loaderData?.error;
  const token = loaderData?.token;

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
        ) : token ? (
          <Form method="get" action={PORTAL_LOGIN_CONFIRM_PATH} className="space-y-4">
            <p className="text-zinc-300 text-sm">
              Tekan tombol di bawah untuk masuk ke dashboard RPP Anda.
            </p>
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400"
            >
              Masuk ke dashboard
            </button>
          </Form>
        ) : null}
      </div>
    </div>
  );
}
