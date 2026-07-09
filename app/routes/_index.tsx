import { redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

export function meta() {
  return [
    { title: "Portal RPP Bot" },
    { name: "description", content: "Portal Rencana Pelaksanaan Pembelajaran Kurikulum Pembelajaran Mendalam" }
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const sessionCookie = cookieHeader?.split(";").find((c) => c.trim().startsWith("session="));
  const telegramUserId = sessionCookie?.split("=")[1];

  if (telegramUserId) {
    return redirect("/dashboard");
  }
  return null;
}

export default function HomeRoute() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-950/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center space-y-10 relative z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            🚀 Powered by Agent-Native
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
            Portal Pembuat <span className="text-indigo-400">RPP</span>
          </h1>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-lg mx-auto">
            Rancang rencana pelaksanaan pembelajaran Kurikulum Pembelajaran Mendalam (PM) secara interaktif dengan asisten AI.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl space-y-2">
            <div className="text-indigo-400 font-bold flex items-center space-x-2">
              <span>🤖 Telegram AI Chatbot</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Diskusikan draf RPP Anda dengan AI secara ramah langsung melalui obrolan Telegram.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl space-y-2">
            <div className="text-emerald-400 font-bold flex items-center space-x-2">
              <span>📄 Parser Dokumen PDF/Word</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Unggah file materi acuan atau silabus, AI akan memproses dan menggunakannya sebagai acuan RPP.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl space-y-2">
            <div className="text-amber-400 font-bold flex items-center space-x-2">
              <span>🖨️ Cetak PDF Berkualitas</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Setelah RPP disepakati, AI akan merender dokumen PDF resmi lengkap dengan kolom tanda tangan.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl space-y-2">
            <div className="text-rose-400 font-bold flex items-center space-x-2">
              <span>🔒 Portal Riwayat Aman</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Masuk secara instan menggunakan Magic Link tanpa password dari Telegram untuk mengunduh arsip Anda.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-3xl max-w-md mx-auto space-y-4">
          <h3 className="text-sm font-semibold text-zinc-300">Cara Mengakses Dashboard Anda</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Silakan buka Telegram Bot RPP Anda dan kirim perintah berikut untuk mendapatkan link masuk aman:
          </p>
          <div className="py-2.5 px-4 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-sm text-indigo-300 inline-block">
            /riwayat
          </div>
        </div>
      </div>
    </div>
  );
}
