import {
  createIntegrationsPlugin,
  telegramAdapter,
  loadActionsFromStaticRegistry,
} from "@agent-native/core/server";
import { getDb, schema } from "../db/index.js";
import { and, desc, eq } from "drizzle-orm";
import crypto from "node:crypto";
import { readBody } from "h3";
// @ts-ignore
import pdfjs from "pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js";
import mammoth from "mammoth";
import QRCode from "qrcode";

// Nitro plugin compiles this registry dynamically from the actions folder
import actionsRegistry from "../../.generated/actions-registry.js";
import { issueMagicLinkToken } from "../auth/web-session.js";
import { buildPortalLoginUrl } from "../auth/portal-routes.js";
import { telegramOwnerEmail } from "../auth/telegram-identity.js";
import { parseRppFinalApproval } from "../rpp/approval-intent.js";
import { RPP_SYSTEM_PROMPT } from "../rpp/system-prompt.js";
import {
  hashAttendanceToken,
  isAttendanceSessionOpen,
  issueAttendanceToken,
  parseAttendanceOpenCommand,
  parseAttendanceStartPayload,
} from "../../domain/attendance.js";

let cachedBotUsername: string | null = null;
const telegramTypingTimers = new Map<string, ReturnType<typeof setInterval>>();

async function sendTelegramTyping(chatId: string | number): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, action: "typing" }),
    });
  } catch (error) {
    // The typing indicator is a best-effort UX enhancement. Never let a
    // temporary Telegram network failure interrupt the actual agent run.
    console.warn("[telegram] Failed to send typing indicator:", error);
  }
}

async function sendTelegramQr(
  chatId: string | number,
  image: Buffer,
  caption: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN belum dikonfigurasi.");

  const form = new FormData();
  form.set("chat_id", String(chatId));
  form.set("caption", caption);
  form.set("parse_mode", "Markdown");
  form.set("photo", new Blob([new Uint8Array(image)], { type: "image/png" }), "qr-presensi.png");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    throw new Error(`Telegram gagal mengirim QR (${response.status}).`);
  }
}

function startTelegramTyping(chatId: string | number): string {
  const key = String(chatId);
  stopTelegramTyping(key);
  void sendTelegramTyping(chatId);

  // Telegram clears `typing` after roughly five seconds. Refresh it while the
  // asynchronously-dispatched agent run is still working.
  const timer = setInterval(() => void sendTelegramTyping(chatId), 4_000);
  timer.unref?.();
  telegramTypingTimers.set(key, timer);
  return key;
}

function stopTelegramTyping(key: string | undefined): void {
  if (!key) return;
  const timer = telegramTypingTimers.get(key);
  if (timer) clearInterval(timer);
  telegramTypingTimers.delete(key);
}

async function getBotUsername(token: string): Promise<string> {
  if (cachedBotUsername) return cachedBotUsername;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = (await res.json()) as any;
    if (data.ok && data.result?.username) {
      cachedBotUsername = data.result.username;
      return cachedBotUsername || "";
    }
  } catch (err) {
    console.error("[telegram] Failed to fetch bot username:", err);
  }
  return "";
}

async function downloadTelegramFile(fileId: string, token: string): Promise<Buffer> {
  const getFileUrl = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
  const getFileRes = await fetch(getFileUrl);
  const getFileData = (await getFileRes.json()) as any;
  if (!getFileData.ok || !getFileData.result?.file_path) {
    throw new Error(getFileData.description || "Gagal mendapatkan path file dari Telegram.");
  }
  const filePath = getFileData.result.file_path;
  const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
  const fileRes = await fetch(downloadUrl);
  const arrayBuffer = await fileRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function parseDocument(buffer: Buffer, fileName: string): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") {
    // Do not call pdf-parse's top-level helper here. It dynamically requires
    // its pdf.js file, which resolves relative to Nitro's _runtime.mjs after
    // bundling and fails in production. A static import keeps the parser in
    // the server bundle and is deterministic in Docker.
    const document = await pdfjs.getDocument(buffer);
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent({
        normalizeWhitespace: false,
        disableCombineTextItems: false,
      });
      pages.push(content.items.map((item: { str?: string }) => item.str ?? "").join(" "));
    }
    document.destroy();
    return pages.join("\n\n");
  } else if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }
  throw new Error(`Format file .${ext} tidak didukung.`);
}

const originalTelegramAdapter = telegramAdapter();

const customTelegramAdapter = {
  ...originalTelegramAdapter,
  async postProcessingPlaceholder(incoming: any) {
    const chatId = incoming.platformContext?.chatId;
    if (chatId === undefined || chatId === null) return null;
    return { placeholderRef: startTelegramTyping(chatId) };
  },
  async sendResponse(message: any, incoming: any, options?: { placeholderRef?: string }) {
    stopTelegramTyping(options?.placeholderRef ?? String(incoming.platformContext?.chatId ?? ""));
    await originalTelegramAdapter.sendResponse(message, incoming, options);
  },
  async parseIncomingMessage(event: any) {
    const body = event.context.__rawBody ?? (await readBody(event).catch(() => null));
    if (!body) return null;

    const message = body.message || body.edited_message;
    if (!message) return null;

    const text = message.text?.trim() || message.caption?.trim() || "";
    const document = message.document;

    if (!text && !document) return null;

    const chat = message.chat;
    const from = message.from;

    const cleanText =
      text === "/start"
        ? "Hello! I'm ready to chat."
        : text.replace(/^\/\w+\s*/, "").trim() || text;

    return {
      platform: "telegram",
      externalThreadId: String(chat.id),
      text: cleanText,
      senderName:
        from?.first_name + (from?.last_name ? ` ${from.last_name}` : ""),
      senderId: String(from?.id),
      platformContext: {
        chatId: chat.id,
        chatType: chat.type,
        messageId: message.message_id,
        rawText: text || "",
        fromId: from?.id,
        fromUsername: from?.username,
        document: document,
      },
      timestamp: message.date * 1000,
    };
  },
};

async function runActionByName(name: string, args: any, userId: string): Promise<any> {
  // Use the generated static registry rather than a variable dynamic import.
  // Nitro only guarantees modules from this registry are present in the
  // production bundle, which is essential for Telegram-only commands.
  const actionModule = (actionsRegistry as Record<string, any>)[name] ?? null;
  if (!actionModule) {
    throw new Error(`Aksi '${name}' tidak ditemukan.`);
  }
  const action = actionModule.default ?? actionModule;
  if (!action?.run) {
    throw new Error(`Aksi '${name}' tidak memiliki method run.`);
  }
  return await action.run(args, {
    userEmail: telegramOwnerEmail(userId),
    caller: "tool",
  });
}

export default createIntegrationsPlugin({
  appId: "rpp-bot",
  adapters: [customTelegramAdapter],
  actions: loadActionsFromStaticRegistry(actionsRegistry),
  resolveOwner: (incoming) => {
    return `${incoming.senderId}@telegram.rppbot`;
  },
  beforeProcess: async (incoming, adapter) => {
    const db = getDb();
    const userId = incoming.senderId;

    if (!userId) {
      return { handled: true };
    }

    const token = process.env.TELEGRAM_BOT_TOKEN || "";
    const rawText = (incoming.platformContext.rawText as string) || incoming.text;
    const trimmed = rawText.trim();

    const initialAdminTelegramId = process.env.INITIAL_ADMIN_TELEGRAM_ID?.trim();
    if (!initialAdminTelegramId || !/^\d+$/.test(initialAdminTelegramId)) {
      console.error("[auth] INITIAL_ADMIN_TELEGRAM_ID must be configured with a numeric Telegram user ID.");
      return {
        handled: true,
        responseText: "RPP Bot belum dikonfigurasi dengan benar. Hubungi administrator sistem.",
      };
    }

    const [configuredAdmin] = await db
      .select({ telegramUserId: schema.authorizedUsers.telegramUserId })
      .from(schema.authorizedUsers)
      .where(eq(schema.authorizedUsers.telegramUserId, initialAdminTelegramId))
      .limit(1);

    if (!configuredAdmin && userId === initialAdminTelegramId) {
      const name = incoming.senderName || "Admin Utama";
      await db.insert(schema.authorizedUsers).values({
        telegramUserId: userId,
        name: name,
        role: "admin",
        organizationId: "default",
        createdAt: Date.now(),
      });
      await db.insert(schema.organizationMemberships).values({ id: `default:${userId}`, organizationId: "default", telegramUserId: userId, role: "platform_admin", createdAt: Date.now() }).onConflictDoNothing();
      console.log(`[auth] Seeded configured initial admin (${name} - ${userId}).`);
    }

    // QR attendance is intentionally available before the teacher-only
    // whitelist check: students authenticate through Telegram plus a
    // short-lived, hashed QR token issued by their teacher.
    const attendancePayload = parseAttendanceStartPayload(trimmed);
    if (attendancePayload) {
      const tokenHash = hashAttendanceToken(attendancePayload);
      const [session] = await db
        .select()
        .from(schema.attendanceSessions)
        .where(eq(schema.attendanceSessions.tokenHash, tokenHash))
        .limit(1);

      if (!session || !isAttendanceSessionOpen(session)) {
        return {
          handled: true,
          responseText: "QR presensi tidak valid atau sesi presensi sudah ditutup/kedaluwarsa.",
        };
      }

      const [existingRecord] = await db
        .select({ id: schema.attendanceRecords.id })
        .from(schema.attendanceRecords)
        .where(
          and(
            eq(schema.attendanceRecords.attendanceSessionId, session.id),
            eq(schema.attendanceRecords.telegramUserId, userId),
          ),
        )
        .limit(1);

      if (existingRecord) {
        return {
          handled: true,
          responseText: `Presensi Anda untuk kelas *${session.className}* sudah tercatat.`,
        };
      }

      const studentName = String(
        incoming.senderName?.trim() || incoming.platformContext.fromUsername || `Siswa ${userId}`,
      );
      await db.insert(schema.attendanceRecords).values({
        id: crypto.randomUUID(),
        attendanceSessionId: String(session.id),
        organizationId: String(session.organizationId),
        telegramUserId: userId,
        studentName,
        source: "telegram_qr",
        checkedInAt: Date.now(),
      });
      return {
        handled: true,
        responseText: `✅ Kehadiran *${studentName}* untuk kelas *${session.className}* berhasil dicatat.`,
      };
    }

    // 2. Cek Akses Whitelist
    const userList = await db
      .select()
      .from(schema.authorizedUsers)
      .where(eq(schema.authorizedUsers.telegramUserId, userId))
      .limit(1);

    const user = userList[0];

    if (!user) {
      return {
        handled: true,
        responseText: `Maaf, Anda tidak memiliki akses untuk menggunakan RPP Bot ini. Silakan hubungi Admin untuk didaftarkan.\n\nID Telegram Anda: \`${userId}\``,
      };
    }

    // 2.5. Penanganan Unggah Dokumen (PDF/DOCX)
    const document = incoming.platformContext.document as any;
    if (document) {
      const maxBytes = 5 * 1024 * 1024;
      if (document.file_size > maxBytes) {
        return {
          handled: true,
          responseText: "Maaf, ukuran berkas terlalu besar. Maksimal ukuran berkas yang diperbolehkan adalah 5 MB.",
        };
      }

      const fileName = document.file_name || "";
      const ext = fileName.split(".").pop()?.toLowerCase();
      if (ext !== "pdf" && ext !== "docx") {
        return {
          handled: true,
          responseText: "Maaf, format berkas tidak didukung. Harap unggah berkas bertipe PDF atau DOCX.",
        };
      }

      try {
        const fileBuffer = await downloadTelegramFile(document.file_id, token);
        const extractedText = await parseDocument(fileBuffer, fileName);

        if (!extractedText.trim()) {
          return {
            handled: true,
            responseText: `Gagal membaca isi berkas *${fileName}*. Pastikan berkas tersebut tidak kosong atau berupa hasil scan gambar.`,
          };
        }

        const header = `[PENGGUNA MENGUNGGAH BERKAS: ${fileName}]\nBerikut adalah teks hasil ekstraksi dari dokumen acuan yang diunggah pengguna:\n---\n`;
        const footer = `\n---\nHarap gunakan teks acuan di atas untuk memandu pembuatan RPP sesuai dengan topik, mata pelajaran, dan acuan materi yang ada di dalamnya.`;

        incoming.text = `${header}${extractedText}${footer}${incoming.text ? `\n\nCatatan Tambahan Pengguna: ${incoming.text}` : ""}`;
      } catch (err: any) {
        console.error("[upload] Gagal memproses file upload:", err);
        return {
          handled: true,
          responseText: `Terjadi kesalahan saat memproses berkas Anda: ${err.message || err}`,
        };
      }
    }

    // 3. Tangani Perintah Khusus Telegram
    const lower = trimmed.toLowerCase();

    // ─── Presensi hybrid: guru membuka QR, siswa scan ke deep-link Telegram ───
    if (/^\/presensi\s+buka\b/i.test(trimmed)) {
      const command = parseAttendanceOpenCommand(trimmed);
      if (!command) {
        return {
          handled: true,
          responseText: "Format salah. Gunakan: `/presensi buka <kelas> [durasi_menit]`\nContoh: `/presensi buka XI RPL 15`",
        };
      }

      const botUsername = await getBotUsername(token);
      if (!botUsername) {
        return {
          handled: true,
          responseText: "Username bot Telegram belum tersedia. Atur username bot melalui BotFather, lalu coba lagi.",
        };
      }

      const now = Date.now();
      const issued = issueAttendanceToken();
      const sessionId = crypto.randomUUID();
      const expiresAt = now + command.durationMinutes * 60_000;
      const deepLink = `https://t.me/${botUsername}?start=att_${issued.token}`;
      await db.insert(schema.attendanceSessions).values({
        id: sessionId,
        organizationId: user.organizationId,
        className: command.className,
        openedByTelegramUserId: userId,
        tokenHash: issued.tokenHash,
        openedAt: now,
        expiresAt,
      });

      try {
        const qrImage = await QRCode.toBuffer(deepLink, {
          type: "png",
          width: 720,
          margin: 2,
          errorCorrectionLevel: "M",
        });
        const chatId = incoming.platformContext.chatId;
        if (chatId === undefined || chatId === null) {
          throw new Error("Chat Telegram tidak ditemukan.");
        }
        await sendTelegramQr(
          String(chatId),
          qrImage,
          `*QR Presensi ${command.className}*\nScan QR ini untuk membuka bot dan mencatat kehadiran.\nBerlaku ${command.durationMinutes} menit.`,
        );
      } catch (error) {
        await db.delete(schema.attendanceSessions).where(eq(schema.attendanceSessions.id, sessionId));
        console.error("[attendance] Failed to generate/send QR:", error);
        return {
          handled: true,
          responseText: "QR presensi gagal dibuat. Sesi tidak dibuka; silakan coba lagi.",
        };
      }

      return {
        handled: true,
        responseText: `Sesi presensi *${command.className}* telah dibuka sampai ${new Date(expiresAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.`,
      };
    }

    if (trimmed === "/presensi tutup") {
      const sessions = await db
        .select()
        .from(schema.attendanceSessions)
        .where(
          and(
            eq(schema.attendanceSessions.organizationId, user.organizationId),
            eq(schema.attendanceSessions.openedByTelegramUserId, userId),
          ),
        )
        .orderBy(desc(schema.attendanceSessions.openedAt))
        .limit(10);
      const session = sessions.find((candidate) => isAttendanceSessionOpen(candidate));
      if (!session) {
        return { handled: true, responseText: "Tidak ada sesi presensi aktif yang Anda buka." };
      }
      await db
        .update(schema.attendanceSessions)
        .set({ closedAt: Date.now() })
        .where(eq(schema.attendanceSessions.id, session.id));
      return { handled: true, responseText: `Sesi presensi *${session.className}* telah ditutup.` };
    }

    if (trimmed === "/presensi rekap") {
      const [session] = await db
        .select()
        .from(schema.attendanceSessions)
        .where(eq(schema.attendanceSessions.organizationId, user.organizationId))
        .orderBy(desc(schema.attendanceSessions.openedAt))
        .limit(1);
      if (!session) {
        return { handled: true, responseText: "Belum ada sesi presensi untuk organisasi ini." };
      }
      const records = await db
        .select({ studentName: schema.attendanceRecords.studentName, checkedInAt: schema.attendanceRecords.checkedInAt })
        .from(schema.attendanceRecords)
        .where(eq(schema.attendanceRecords.attendanceSessionId, session.id))
        .orderBy(schema.attendanceRecords.checkedInAt);
      const names = records.slice(0, 30).map((record, index) => `${index + 1}. ${record.studentName}`).join("\n");
      return {
        handled: true,
        responseText: `*Rekap Presensi ${session.className}*\nHadir: *${records.length}* siswa\n${names || "Belum ada siswa yang hadir."}`,
      };
    }

    // Perintah /addguru (Hanya Admin)
    if (trimmed.startsWith("/addguru")) {
      if (user.role !== "admin") {
        return {
          handled: true,
          responseText: "Maaf, hanya Admin yang dapat mendaftarkan guru baru.",
        };
      }

      const match = /^\/addguru\s+(\d+)\s+(.+)$/i.exec(trimmed);
      if (!match) {
        return {
          handled: true,
          responseText: "Format salah. Gunakan:\n`/addguru <id_telegram> <Nama Lengkap Guru>`",
        };
      }

      const targetId = match[1];
      const targetName = match[2].trim();

      try {
        await db.insert(schema.authorizedUsers).values({
          telegramUserId: targetId,
          name: targetName,
          role: "user",
          organizationId: user.organizationId,
          createdAt: Date.now(),
        });
        await db.insert(schema.organizationMemberships).values({ id: crypto.randomUUID(), organizationId: user.organizationId, telegramUserId: targetId, role: "teacher", createdAt: Date.now() });
        return {
          handled: true,
          responseText: `Guru *${targetName}* dengan ID Telegram \`${targetId}\` berhasil didaftarkan.`,
        };
      } catch (err) {
        return {
          handled: true,
          responseText: `Gagal mendaftarkan: ID Telegram \`${targetId}\` sudah terdaftar sebelumnya.`,
        };
      }
    }

    // Perintah /removeguru (Hanya Admin)
    if (trimmed.startsWith("/removeguru")) {
      if (user.role !== "admin") {
        return {
          handled: true,
          responseText: "Maaf, hanya Admin yang dapat menghapus guru.",
        };
      }

      const match = /^\/removeguru\s+(\d+)$/i.exec(trimmed);
      if (!match) {
        return {
          handled: true,
          responseText: "Format salah. Gunakan:\n`/removeguru <id_telegram>`",
        };
      }

      const targetId = match[1];

      if (targetId === userId) {
        return {
          handled: true,
          responseText: "Anda tidak bisa menghapus akun Admin Anda sendiri.",
        };
      }

      const targetList = await db
        .select()
        .from(schema.authorizedUsers)
        .where(eq(schema.authorizedUsers.telegramUserId, targetId))
        .limit(1);

      if (targetList.length === 0) {
        return {
          handled: true,
          responseText: `ID Telegram \`${targetId}\` tidak ditemukan dalam daftar whitelist.`,
        };
      }

      await db
        .delete(schema.authorizedUsers)
        .where(eq(schema.authorizedUsers.telegramUserId, targetId));

      return {
        handled: true,
        responseText: `Guru *${targetList[0].name}* (\`${targetId}\`) berhasil dihapus dari daftar whitelist.`,
      };
    }

    // Perintah /riwayat (Akses Aman via DM)
    if (trimmed === "/riwayat") {
      const { token: tokenUUID, tokenHash } = issueMagicLinkToken();
      const expiresAt = Date.now() + 60 * 60 * 1000;

      await db.insert(schema.webSessions).values({
        tokenHash,
        telegramUserId: userId,
        expiresAt,
      });

      const appUrl = process.env.APP_URL || "http://localhost:8080";
      const magicLink = buildPortalLoginUrl(appUrl, tokenUUID);

      const chatType = incoming.platformContext.chatType as string;
      const isGroup = chatType === "group" || chatType === "supergroup";

      if (isGroup) {
        if (adapter.sendMessageToTarget) {
          try {
            await adapter.sendMessageToTarget(
              {
                text: `Halo ${user.name},\n\nBerikut adalah link login rahasia Anda untuk mengakses riwayat RPP:\n\n${magicLink}\n\n*Catatan:* Link ini hanya berlaku selama 1 jam dan sekali pakai.`,
                platformContext: { parse_mode: "Markdown" },
              },
              { destination: userId }
            );
          } catch (dmErr) {
            return {
              handled: true,
              responseText: `Gagal mengirim link ke DM pribadi Anda. Pastikan Anda telah memulai chat pribadi dengan bot ini terlebih dahulu (tekan /start di DM).`,
            };
          }
        }
        return {
          handled: true,
          responseText: `Halo ${user.name}, demi alasan keamanan, saya telah mengirimkan link masuk riwayat RPP ke DM pribadi Anda.`,
        };
      } else {
        return {
          handled: true,
          responseText: `Halo ${user.name},\n\nBerikut adalah link login rahasia Anda untuk mengakses riwayat RPP:\n\n${magicLink}\n\n*Catatan:* Link ini hanya berlaku selama 1 jam dan sekali pakai.`,
        };
      }
    }

    // 3.5. Perintah /hubungkan - Link IdeTech Account
    if (trimmed === "/hubungkan") {
      return {
        handled: true,
        responseText: `Untuk menghubungkan akun Telegram dengan IdeTech, gunakan:\n\n\`/hubungkan email@domain.com\`\n\nContoh: \`/hubungkan admin@idetech.example\``,
      };
    }

    const linkMatch = /^\/hubungkan\s+(\S+@\S+\.\S+)$/i.exec(trimmed);
    if (linkMatch) {
      const email = linkMatch[1].trim();
      try {
        const result = await runActionByName(
          "link-idetech-account",
          { email },
          userId
        );
        return {
          handled: true,
          responseText: result.message ?? "Akun berhasil dihubungkan.",
        };
      } catch (err: any) {
        return {
          handled: true,
          responseText: `Gagal menghubungkan akun: ${err.message || err}`,
        };
      }
    }

    // 3.6. Perintah Konten IdeTech (Natural Language)
    const createAnnouncementMatch = /^buat pengumuman (.+)$/i.exec(trimmed);
    if (createAnnouncementMatch) {
      const fullText = createAnnouncementMatch[1].trim();
      const title = fullText.split(/[.!?\n]/)[0]?.trim()?.slice(0, 100) || "Pengumuman Baru";
      const content = fullText;
      try {
        const result = await runActionByName(
          "manage-content",
          {
            contentType: "announcement",
            action: "create",
            title,
            content,
          },
          userId
        );
        return {
          handled: true,
          responseText: result.message ?? "Pengumuman berhasil dibuat.",
        };
      } catch (err: any) {
        return {
          handled: true,
          responseText: `Gagal membuat pengumuman: ${err.message || err}`,
        };
      }
    }

    const createBlogMatch = /^buat artikel (.+)$/i.exec(trimmed);
    if (createBlogMatch) {
      const fullText = createBlogMatch[1].trim();
      const title = fullText.split(/[.!?\n]/)[0]?.trim()?.slice(0, 100) || "Artikel Baru";
      const content = fullText;
      try {
        const result = await runActionByName(
          "manage-content",
          {
            contentType: "blog",
            action: "create",
            title,
            content,
          },
          userId
        );
        return {
          handled: true,
          responseText: result.message ?? "Artikel berhasil dibuat.",
        };
      } catch (err: any) {
        return {
          handled: true,
          responseText: `Gagal membuat artikel: ${err.message || err}`,
        };
      }
    }

    if (lower === "daftar pengumuman" || lower === "list pengumuman") {
      try {
        const result = await runActionByName(
          "list-content",
          { contentType: "announcement", status: "all", limit: 10 },
          userId
        );
        if (!result.items || result.items.length === 0) {
          return { handled: true, responseText: "Belum ada pengumuman." };
        }
        const lines = result.items.map((item: any, i: number) =>
          `${i + 1}. [${String(item.status).toUpperCase()}] ${item.title} — \`${item.id}\`${item.type ? ` (${item.type})` : ""}`
        );
        return {
          handled: true,
          responseText: `📋 ${result.items.length} pengumuman terakhir:\n${lines.join("\n")}`,
        };
      } catch (err: any) {
        return {
          handled: true,
          responseText: `Gagal mengambil daftar pengumuman: ${err.message || err}`,
        };
      }
    }

    if (lower === "daftar artikel" || lower === "list artikel") {
      try {
        const result = await runActionByName(
          "list-content",
          { contentType: "blog", status: "all", limit: 10 },
          userId
        );
        if (!result.items || result.items.length === 0) {
          return { handled: true, responseText: "Belum ada artikel." };
        }
        const lines = result.items.map((item: any, i: number) =>
          `${i + 1}. [${String(item.status).toUpperCase()}] ${item.title} — \`${item.id}\`${item.slug ? ` (${item.slug})` : ""}`
        );
        return {
          handled: true,
          responseText: `📋 ${result.items.length} artikel terakhir:\n${lines.join("\n")}`,
        };
      } catch (err: any) {
        return {
          handled: true,
          responseText: `Gagal mengambil daftar artikel: ${err.message || err}`,
        };
      }
    }

    const deleteAnnouncementMatch = /^hapus pengumuman (\S+)$/i.exec(trimmed);
    if (deleteAnnouncementMatch) {
      const id = deleteAnnouncementMatch[1];
      try {
        const result = await runActionByName(
          "delete-content",
          { contentType: "announcement", id },
          userId
        );
        return {
          handled: true,
          responseText: result.message ?? "Pengumuman berhasil dihapus.",
        };
      } catch (err: any) {
        return {
          handled: true,
          responseText: `Gagal menghapus pengumuman: ${err.message || err}`,
        };
      }
    }

    const deleteBlogMatch = /^hapus artikel (\S+)$/i.exec(trimmed);
    if (deleteBlogMatch) {
      const id = deleteBlogMatch[1];
      try {
        const result = await runActionByName(
          "delete-content",
          { contentType: "blog", id },
          userId
        );
        return {
          handled: true,
          responseText: result.message ?? "Artikel berhasil dihapus.",
        };
      } catch (err: any) {
        return {
          handled: true,
          responseText: `Gagal menghapus artikel: ${err.message || err}`,
        };
      }
    }

    const publishBlogMatch = /^publikasikan artikel (\S+)$/i.exec(trimmed);
    if (publishBlogMatch) {
      const id = publishBlogMatch[1];
      try {
        const result = await runActionByName(
          "toggle-content-status",
          { contentType: "blog", id, status: "published" },
          userId
        );
        return {
          handled: true,
          responseText: result.message ?? "Artikel berhasil dipublikasikan.",
        };
      } catch (err: any) {
        return {
          handled: true,
          responseText: `Gagal mempublikasikan artikel: ${err.message || err}`,
        };
      }
    }

    const deactivateMatch = /^nonaktifkan pengumuman (\S+)$/i.exec(trimmed);
    if (deactivateMatch) {
      const id = deactivateMatch[1];
      try {
        const result = await runActionByName(
          "toggle-content-status",
          { contentType: "announcement", id, status: "inactive" },
          userId
        );
        return {
          handled: true,
          responseText: result.message ?? "Pengumuman berhasil dinonaktifkan.",
        };
      } catch (err: any) {
        return {
          handled: true,
          responseText: `Gagal menonaktifkan pengumuman: ${err.message || err}`,
        };
      }
    }

    // Persetujuan akhir diproses tanpa LLM agar draf yang telah tersimpan
    // tidak bergantung pada model untuk meneruskan dua action berurutan.
    // Hanya perintah eksplisit yang ditangani di sini; persetujuan terhadap
    // pertanyaan klarifikasi tetap diteruskan ke agen untuk menyusun draf.
    const exportFormat = parseRppFinalApproval(trimmed);
    if (exportFormat) {
      const [draft] = await db
        .select({ id: schema.rppDocuments.id, topic: schema.rppDocuments.topic })
        .from(schema.rppDocuments)
        .where(
          and(
            eq(schema.rppDocuments.telegramUserId, userId),
            eq(schema.rppDocuments.organizationId, user.organizationId),
            eq(schema.rppDocuments.status, "draft"),
          ),
        )
        .orderBy(desc(schema.rppDocuments.createdAt))
        .limit(1);

      if (draft) {
        try {
          await runActionByName("approve-rpp", { rppId: draft.id }, userId);
          const queued = await runActionByName(
            "queue-rpp-export",
            { rppId: draft.id, format: exportFormat },
            userId,
          );
          return {
            handled: true,
            responseText: `Draf RPP *${draft.topic}* telah disetujui. Berkas ${exportFormat.toUpperCase()} sedang diproses (job: \`${queued.jobId}\`). Saya akan mengirimkan hasilnya setelah siap.`,
          };
        } catch (err: any) {
          console.error("[rpp] Failed to approve or queue export:", err);
          return {
            handled: true,
            responseText: "Draf RPP sudah ditemukan, tetapi proses ekspor belum dapat dimulai. Silakan kirim *Cetak* sekali lagi dalam beberapa saat.",
          };
        }
      }

      return {
        handled: true,
        responseText: "Belum ada draf RPP tersimpan yang dapat dicetak. Silakan kirim *Lanjutkan buat draf RPP lengkap* agar saya menyusun dan menyimpan draf terlebih dahulu.",
      };
    }

    const activateMatch = /^aktifkan pengumuman (\S+)$/i.exec(trimmed);
    if (activateMatch) {
      const id = activateMatch[1];
      try {
        const result = await runActionByName(
          "toggle-content-status",
          { contentType: "announcement", id, status: "active" },
          userId
        );
        return {
          handled: true,
          responseText: result.message ?? "Pengumuman berhasil diaktifkan.",
        };
      } catch (err: any) {
        return {
          handled: true,
          responseText: `Gagal mengaktifkan pengumuman: ${err.message || err}`,
        };
      }
    }

    // 4. Aturan Chat Grup (Hanya respons jika di-tag / me-reply bot)
    const chatType = incoming.platformContext.chatType as string;
    const isGroup = chatType === "group" || chatType === "supergroup";

    if (isGroup) {
      const botUsername = await getBotUsername(token);
      const mention = `@${botUsername}`;

      const rawBody = (incoming.platformContext as any)?.__rawBody || {};
      const replyTo = rawBody?.message?.reply_to_message;
      const isReplyToBot = replyTo?.from?.username === botUsername;

      if (!trimmed.includes(mention) && !isReplyToBot) {
        return { handled: true };
      }
    }

    return { handled: false };
  },
  systemPrompt: RPP_SYSTEM_PROMPT,
});
