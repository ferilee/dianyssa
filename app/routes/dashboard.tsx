import { redirect, useLoaderData, useRevalidator } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getDb, schema } from "../../server/db/index.js";
import { eq, desc, inArray } from "drizzle-orm";
import { useEffect, useState } from "react";
import { clearSessionCookie, getWebSessionUserId, revokeWebSession } from "../../server/auth/web-session.js";

// Tipe Data untuk RPP dan User
interface RppDocument {
  id: string;
  telegramUserId: string;
  teacherName: string;
  headmasterName: string;
  schoolName: string;
  academicYear: string;
  subject: string;
  grade: string;
  topic: string;
  content: string;
  pdfPath: string;
  createdAt: number;
}

interface RppArtifact { id: string; rppDocumentId: string; format: string; status: string; }
interface RppExportJob { id: string; rppDocumentId: string; status: string; error: string | null; }

interface AuthorizedUser {
  telegramUserId: string;
  name: string;
  role: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // 1. Cek sesi
  const telegramUserId = await getWebSessionUserId(request);

  if (!telegramUserId) {
    return redirect("/");
  }

  const db = getDb();

  // 2. Ambal data user info
  const userResults = await db
    .select()
    .from(schema.authorizedUsers)
    .where(eq(schema.authorizedUsers.telegramUserId, telegramUserId))
    .limit(1);

  if (userResults.length === 0) {
    // Sesi tidak valid (user tidak terdaftar di whitelist)
    return redirect("/logout");
  }

  const currentUser = userResults[0];

  // 3. Ambil data RPP berdasarkan role
  let rpps: RppDocument[] = [];
  if (currentUser.role === "admin") {
    // Admin dapat melihat seluruh RPP yang pernah dibuat
    rpps = await db
      .select()
      .from(schema.rppDocuments)
      .orderBy(desc(schema.rppDocuments.createdAt));
  } else {
    // Guru biasa hanya dapat melihat RPP milik sendiri
    rpps = await db
      .select()
      .from(schema.rppDocuments)
      .where(eq(schema.rppDocuments.telegramUserId, telegramUserId))
      .orderBy(desc(schema.rppDocuments.createdAt));
  }

  const rppIds = rpps.map((rpp) => rpp.id);
  const artifacts: RppArtifact[] = rppIds.length ? await db.select({ id: schema.rppArtifacts.id, rppDocumentId: schema.rppArtifacts.rppDocumentId, format: schema.rppArtifacts.format, status: schema.rppArtifacts.status }).from(schema.rppArtifacts).where(inArray(schema.rppArtifacts.rppDocumentId, rppIds)) : [];
  const jobs: RppExportJob[] = rppIds.length ? await db.select({ id: schema.rppExportJobs.id, rppDocumentId: schema.rppExportJobs.rppDocumentId, status: schema.rppExportJobs.status, error: schema.rppExportJobs.error }).from(schema.rppExportJobs).where(inArray(schema.rppExportJobs.rppDocumentId, rppIds)).orderBy(desc(schema.rppExportJobs.createdAt)) : [];

  return {
    user: currentUser,
    rpps,
    artifacts,
    jobs,
  };
}

export async function action({ request }: { request: Request }) {
  // Aksi Logout
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    await revokeWebSession(request);
    return redirect("/", {
      headers: {
        "Set-Cookie": clearSessionCookie(),
      },
    });
  }
  return null;
}

// Komponen Pembantu Render Markdown Sederhana
function RppMarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  let inList = false;

  return (
    <div className="space-y-4 text-zinc-300 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          if (inList) {
            inList = false;
            return <div key={idx} className="h-2"></div>;
          }
          return null;
        }

        // Bold match
        const parts = [];
        let boldRegex = /\*\*(.*?)\*\*/g;
        let lastIndex = 0;
        let match;
        while ((match = boldRegex.exec(trimmed)) !== null) {
          if (match.index > lastIndex) {
            parts.push(trimmed.substring(lastIndex, match.index));
          }
          parts.push(<strong key={match.index} className="font-semibold text-zinc-100">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < trimmed.length) {
          parts.push(trimmed.substring(lastIndex));
        }

        const lineContent = parts.length > 0 ? parts : trimmed;

        // Headings
        if (trimmed.startsWith("### ")) {
          inList = false;
          return (
            <h4 key={idx} className="text-base font-bold text-zinc-200 mt-5 mb-2">
              {trimmed.substring(4)}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          inList = false;
          return (
            <h3 key={idx} className="text-lg font-extrabold text-indigo-300 border-b border-zinc-800 pb-1 mt-6 mb-3 uppercase tracking-wide">
              {trimmed.substring(3)}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          inList = false;
          return (
            <h2 key={idx} className="text-xl font-black text-center text-indigo-400 mt-8 mb-4 uppercase tracking-widest border-b-2 border-indigo-900 pb-2">
              {trimmed.substring(2)}
            </h2>
          );
        }

        // List items
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          inList = true;
          return (
            <div key={idx} className="flex items-start pl-4 space-x-2">
              <span className="text-indigo-400 mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span>{typeof lineContent === "string" ? trimmed.substring(2) : lineContent}</span>
            </div>
          );
        }

        // Default Paragraph
        inList = false;
        return (
          <p key={idx} className="text-justify">
            {lineContent}
          </p>
        );
      })}
    </div>
  );
}

export default function DashboardRoute() {
  const { user, rpps, artifacts, jobs } = useLoaderData() as { user: AuthorizedUser; rpps: RppDocument[]; artifacts: RppArtifact[]; jobs: RppExportJob[] };
  const revalidator = useRevalidator();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [activePreviewRpp, setActivePreviewRpp] = useState<RppDocument | null>(null);

  useEffect(() => {
    if (!jobs.some((job) => job.status === "queued" || job.status === "processing")) return;
    const timer = window.setInterval(() => revalidator.revalidate(), 5_000);
    return () => window.clearInterval(timer);
  }, [jobs, revalidator]);

  // Cari list kelas unik untuk dropdown filter
  const grades = ["All", ...Array.from(new Set(rpps.map((r) => r.grade)))];

  // Filter RPP
  const filteredRpps = rpps.filter((rpp) => {
    const matchesSearch =
      rpp.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rpp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rpp.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === "All" || rpp.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header Portal */}
      <header className="border-b border-zinc-850 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Portal Riwayat RPP</h1>
            <p className="text-xs text-zinc-400">Kurikulum Pembelajaran Mendalam (PM)</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold">{user.name}</div>
            <div className="text-xs text-zinc-400 capitalize">
              {user.role === "admin" ? "🛡️ Administrator" : "🧑‍🏫 Guru"}
            </div>
          </div>

          <form method="post" className="flex items-center">
            <input type="hidden" name="intent" value="logout" />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold transition duration-200 border border-zinc-750"
            >
              Keluar
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Card Ringkasan Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800/80 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="p-3.5 bg-indigo-950/80 text-indigo-400 rounded-xl border border-indigo-900/50">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black">{rpps.length}</div>
              <div className="text-xs text-zinc-400 font-medium">Total RPP Dihasilkan</div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800/80 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="p-3.5 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-900/50">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black">
                {new Set(rpps.map((r) => r.subject)).size}
              </div>
              <div className="text-xs text-zinc-400 font-medium">Mata Pelajaran Aktif</div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800/80 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="p-3.5 bg-amber-950/80 text-amber-400 rounded-xl border border-amber-900/50">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-100">
                {rpps.length > 0
                  ? new Date(rpps[0].createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </div>
              <div className="text-xs text-zinc-400 font-medium">Dokumen Terakhir Dibuat</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-zinc-900 border border-zinc-800/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari berdasarkan topik, mapel, atau guru..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition duration-150"
            />
          </div>

          <div className="flex w-full md:w-auto items-center space-x-3">
            <label className="text-xs font-semibold text-zinc-400 shrink-0">Filter Kelas:</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition duration-150 cursor-pointer w-full md:w-40"
            >
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabel / Daftar Dokumen RPP */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          {filteredRpps.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center space-y-3">
              <svg className="w-12 h-12 text-zinc-6550" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0h-1.5m-13 0H4" />
              </svg>
              <div>
                <p className="font-semibold text-zinc-400">Tidak ada dokumen RPP</p>
                <p className="text-xs text-zinc-500 mt-1">Gunakan bot Telegram RPP Anda untuk membuat RPP baru.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/40 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Topik & Mapel</th>
                    <th className="px-6 py-4">Kelas / Semester</th>
                    {user.role === "admin" && <th className="px-6 py-4">Dibuat Oleh</th>}
                    <th className="px-6 py-4">Tanggal Dibuat</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-sm">
                  {filteredRpps.map((rpp) => (
                    <tr key={rpp.id} className="hover:bg-zinc-850/30 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-100 text-base">{rpp.topic}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{rpp.subject}</div>
                        {jobs.find((job) => job.rppDocumentId === rpp.id) && (
                          <div className="text-[10px] uppercase text-indigo-300 mt-1">{jobs.find((job) => job.rppDocumentId === rpp.id)?.status}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-medium">{rpp.grade}</td>
                      {user.role === "admin" && (
                        <td className="px-6 py-4">
                          <div className="font-semibold text-zinc-200">{rpp.teacherName}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">ID: {rpp.telegramUserId}</div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-zinc-400 text-xs">
                        {new Date(rpp.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2.5">
                          <button
                            onClick={() => setActivePreviewRpp(rpp)}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-indigo-400 rounded-lg text-xs font-semibold transition duration-150 border border-zinc-750 flex items-center space-x-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Preview</span>
                          </button>

                          <a
                            href={`/download/${rpp.id}`}
                            className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-900/60 text-indigo-400 hover:text-indigo-300 rounded-lg text-xs font-semibold transition duration-150 flex items-center space-x-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Unduh PDF</span>
                          </a>
                          {artifacts.filter((artifact) => artifact.rppDocumentId === rpp.id).map((artifact) => (
                            <a key={artifact.id} href={`/artifacts/${artifact.id}`} className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-900/60 text-emerald-300 rounded-lg text-xs font-semibold">
                              Unduh {artifact.format.toUpperCase()}
                            </a>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* RPP Preview Modal (Full Panel) */}
      {activePreviewRpp && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-end z-50 transition duration-300">
          <div className="w-full max-w-4xl h-full bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl animate-slide-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-zinc-850 bg-zinc-950/30 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">{activePreviewRpp.topic}</h3>
                <p className="text-xs text-zinc-400">
                  {activePreviewRpp.subject} • {activePreviewRpp.grade} • TA {activePreviewRpp.academicYear}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href={`/download/${activePreviewRpp.id}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition duration-150 flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Cetak PDF</span>
                </a>

                <button
                  onClick={() => setActivePreviewRpp(null)}
                  className="p-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-xl transition duration-150 border border-zinc-800"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body / Preview Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-zinc-950/40">
              <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-850 p-8 rounded-2xl shadow-xl space-y-6">
                {/* RPP Header Kop */}
                <div className="text-center border-b-2 border-zinc-800 pb-4 mb-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                    {activePreviewRpp.schoolName}
                  </h4>
                  <h1 className="text-lg font-black uppercase mt-1 tracking-widest text-zinc-100">
                    RENCANA PELAKSANAAN PEMBELAJARAN
                  </h1>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Kurikulum Pembelajaran Mendalam (PM)
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-950/30 p-4 rounded-xl border border-zinc-850">
                  <div>
                    <span className="text-zinc-500 block">Mata Pelajaran</span>
                    <span className="font-semibold text-zinc-200">{activePreviewRpp.subject}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Guru Pengampu</span>
                    <span className="font-semibold text-zinc-200">{activePreviewRpp.teacherName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Kelas / Semester</span>
                    <span className="font-semibold text-zinc-200">{activePreviewRpp.grade}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Tahun Akademik</span>
                    <span className="font-semibold text-zinc-200">{activePreviewRpp.academicYear}</span>
                  </div>
                </div>

                {/* RPP Content Render */}
                <div className="mt-8">
                  <RppMarkdownRenderer content={activePreviewRpp.content} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
