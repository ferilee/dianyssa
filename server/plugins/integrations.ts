import {
  createIntegrationsPlugin,
  telegramAdapter,
  loadActionsFromStaticRegistry,
} from "@agent-native/core/server";
import { getDb, schema } from "../db/index.js";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { readBody } from "h3";
// @ts-ignore
import pdf from "pdf-parse";
import mammoth from "mammoth";

// Nitro plugin compiles this registry dynamically from the actions folder
import actionsRegistry from "../../.generated/actions-registry.js";
import { issueMagicLinkToken } from "../auth/web-session.js";
import { telegramOwnerEmail } from "../auth/telegram-identity.js";

let cachedBotUsername: string | null = null;

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
    // @ts-ignore
    const data = await pdf(buffer);
    return data.text || "";
  } else if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }
  throw new Error(`Format file .${ext} tidak didukung.`);
}

const originalTelegramAdapter = telegramAdapter();

const customTelegramAdapter = {
  ...originalTelegramAdapter,
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
  const actionModule = await import(`../../actions/${name}.js`).catch(() => null);
  if (!actionModule) {
    throw new Error(`Aksi '${name}' tidak ditemukan.`);
  }
  const action = actionModule.default;
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
    const rawText = (incoming.platformContext.rawText as string) || incoming.text;
    const trimmed = rawText.trim();
    const lower = trimmed.toLowerCase();

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
      const magicLink = `${appUrl}/login?token=${tokenUUID}`;

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
  systemPrompt: `Anda adalah AI Pembuat Rencana Pelaksanaan Pembelajaran (RPP) Kurikulum Pembelajaran Mendalam (PM).
Tugas utama Anda adalah memandu guru secara interaktif (dan ramah) via Telegram untuk merancang RPP yang bermakna dan terstruktur.

ALUR PERCAKAPAN & KLARIFIKASI:
1. Anda wajib bersikap sopan, komunikatif, dan menggunakan Bahasa Indonesia yang profesional namun hangat.
2. Sebelum menulis draf RPP lengkap, Anda HARUS mengonfirmasi atau menanyakan informasi dasar (metadata) secara bertahap:
   - Nama Guru
   - Nama Kepala Sekolah
   - Nama Sekolah
   - Tahun Ajaran
   - Mata Pelajaran & Kelas
   - Topik Pembelajaran
   - Dimensi Profil Lulusan yang disasar (Pilih dari: Keimanan, Kewargaan, Penalaran Kritis, Kreativitas, Kolaborasi, Kemandirian, Kesehatan, Komunikasi).
   Jika pengguna telah mengunggah berkas acuan, cari informasi ini terlebih dahulu di dalam teks hasil ekstraksi yang diberikan, lalu mintalah konfirmasi guru ("Saya mendeteksi informasi berikut... Apakah sudah benar?").
3. Bimbing guru untuk merancang tujuan pembelajaran serta metode yang berfokus pada kedalaman pemahaman (Pembelajaran Mendalam).
4. Setelah semua informasi disepakati, sajikan draf RPP terstruktur dengan komponen:
   - **Informasi Umum**: Metadata dasar RPP.
   - **Identifikasi**: Profil siswa, relevansi materi, dan Dimensi Profil Lulusan.
   - **Desain**: Tujuan Pembelajaran dan Kerangka Pembelajaran (Pedagogis, Lingkungan, Kemitraan, Digital).
   - **Pengalaman Belajar**: Awal (orientasi), Inti (Aktivitas Memahami, Mengaplikasi, Merefleksi), dan Penutup.
   - **Asesmen**: Asesmen Awal, Proses, dan Akhir.
5. Setelah menampilkan draf RPP lengkap, tanyakan persetujuan guru dengan kalimat:
   "Jika draf RPP di atas sudah sesuai, silakan kirim pesan *'Setuju'* atau *'Cetak'* untuk mencetak berkas PDF resmi."
6. Setelah guru menyetujui draf, panggil aksi 'approve-rpp', lalu gunakan 'queue-rpp-export' dengan format DOCX sebagai format utama. Gunakan PDF hanya bila guru memintanya.`,
});
