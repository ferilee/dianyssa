import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { getDb, schema } from "../server/db/index.js";
import { eq } from "drizzle-orm";
import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { assertRppAccess, requireAuthorizedActor } from "../server/auth/authorization.js";
import { rppDraftSchema, rppDraftToMarkdown } from "../domain/rpp.js";

// Helper sederhana untuk mengubah Markdown menjadi HTML terstruktur dengan kelas Tailwind
function markdownToHtml(markdown: string): string {
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold text (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Headings
  html = html.replace(/^### (.*?)$/gm, "<h3 class='text-base font-bold mt-4 mb-2 text-gray-800'>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2 class='text-lg font-bold mt-6 mb-3 border-b border-gray-300 pb-1 uppercase tracking-wide text-gray-900'>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1 class='text-xl font-extrabold mt-8 mb-4 uppercase tracking-widest text-center text-gray-900 border-b-2 border-gray-800 pb-2'>$1</h1>");

  // Lists
  const lines = html.split(/\n/);
  let result = "";
  let inList = false;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        result += "</ul>\n";
        inList = false;
      }
      continue;
    }

    const listMatch = /^[-\*]\s+(.*)$/.exec(trimmed);
    if (listMatch) {
      if (!inList) {
        result += "<ul class='list-disc pl-6 mb-4 space-y-1 text-gray-700'>\n";
        inList = true;
      }
      result += `  <li>${listMatch[1]}</li>\n`;
    } else {
      if (inList) {
        result += "</ul>\n";
        inList = false;
      }

      if (trimmed.startsWith("<h") || trimmed.startsWith("<ul") || trimmed.startsWith("<li") || trimmed.startsWith("<div") || trimmed.startsWith("<table")) {
        result += trimmed + "\n";
      } else {
        result += `<p class='mb-3 text-justify text-gray-700 leading-relaxed'>${trimmed}</p>\n`;
      }
    }
  }

  if (inList) {
    result += "</ul>\n";
  }

  return result;
}

export default defineAction({
  description: "Mengekspor draf RPP yang disetujui menjadi dokumen PDF resmi menggunakan Puppeteer dan mengirimkannya ke Telegram.",
  schema: z.object({
    rppId: z.string().describe("ID dokumen RPP di database"),
  }),
  run: async ({ rppId }, ctx) => {
    const actor = await requireAuthorizedActor(ctx);
    const db = getDb();
    
    // 1. Ambil data RPP dari database
    const results = await db
      .select()
      .from(schema.rppDocuments)
      .where(eq(schema.rppDocuments.id, rppId))
      .limit(1);

    if (results.length === 0) {
      return {
        status: "error",
        message: `Dokumen RPP dengan ID ${rppId} tidak ditemukan.`,
      };
    }

    const rpp = results[0];
    assertRppAccess(actor, rpp.telegramUserId);
    if (rpp.status !== "approved") {
      return {
        status: "error",
        message: "RPP harus disetujui terlebih dahulu sebelum diekspor.",
      };
    }
    if (!rpp.contentJson) {
      return { status: "error", message: "RPP lama tidak memiliki data terstruktur untuk diekspor ke PDF." };
    }
    const contentHtml = markdownToHtml(rppDraftToMarkdown(rppDraftSchema.parse(JSON.parse(rpp.contentJson))));

    // 2. Susun template HTML resmi
    const formattedDate = new Date(rpp.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const fullHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>RPP - ${rpp.subject}</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body class="bg-white text-gray-800 p-8 max-w-[21cm] mx-auto text-sm">
  <!-- Kop Surat Resmi -->
  <div class="text-center border-b-4 border-double border-gray-800 pb-4 mb-6">
    <h2 class="text-lg font-bold uppercase tracking-wider">${rpp.schoolName}</h2>
    <h1 class="text-xl font-extrabold uppercase tracking-widest mt-1">RENCANA PELAKSANAAN PEMBELAJARAN (RPP)</h1>
    <p class="text-xs text-gray-600 mt-1">Kurikulum Pembelajaran Mendalam (PM) • Tahun Ajaran ${rpp.academicYear}</p>
  </div>

  <!-- Metadata Tabel -->
  <div class="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
    <table class="w-full text-xs">
      <tbody>
        <tr>
          <td class="w-1/4 font-semibold py-1">Mata Pelajaran</td>
          <td class="w-4 py-1">:</td>
          <td class="py-1 font-medium text-gray-900">${rpp.subject}</td>
          <td class="w-1/4 font-semibold py-1">Guru Mapel</td>
          <td class="w-4 py-1">:</td>
          <td class="py-1 font-medium text-gray-900">${rpp.teacherName}</td>
        </tr>
        <tr>
          <td class="font-semibold py-1">Kelas / Semester</td>
          <td>:</td>
          <td class="py-1 font-medium text-gray-900">${rpp.grade}</td>
          <td class="font-semibold py-1">Kepala Sekolah</td>
          <td>:</td>
          <td class="py-1 font-medium text-gray-900">${rpp.headmasterName}</td>
        </tr>
        <tr>
          <td class="font-semibold py-1">Topik Pembelajaran</td>
          <td>:</td>
          <td class="py-1 font-medium text-gray-900">${rpp.topic}</td>
          <td class="font-semibold py-1">Tanggal Dibuat</td>
          <td>:</td>
          <td class="py-1 font-medium text-gray-900">${formattedDate}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Konten RPP -->
  <div class="prose max-w-none text-xs leading-relaxed mb-12">
    ${contentHtml}
  </div>

  <!-- Kolom Tanda Tangan -->
  <div class="w-full text-xs mt-12 page-break-inside-avoid">
    <table class="w-full border-none">
      <tbody>
        <tr class="border-none">
          <td class="w-1/2 text-center pb-20 border-none">
            Mengetahui,<br>
            <strong>Kepala Sekolah</strong>
          </td>
          <td class="w-1/2 text-center pb-20 border-none">
            Jakarta, ${formattedDate}<br>
            <strong>Guru Mata Pelajaran</strong>
          </td>
        </tr>
        <tr class="border-none">
          <td class="text-center font-bold border-none">
            <u>${rpp.headmasterName}</u><br>
            <span class="text-[10px] font-normal text-gray-500">NIP. _____________________</span>
          </td>
          <td class="text-center font-bold border-none">
            <u>${rpp.teacherName}</u><br>
            <span class="text-[10px] font-normal text-gray-500">NIP. _____________________</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>
    `;

    // 3. Render HTML ke PDF menggunakan Puppeteer
    const pdfDir = path.join(process.cwd(), "data", "pdfs");
    const pdfPath = path.join(pdfDir, `rpp-${rppId}.pdf`);

    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    let pdfBuffer: Buffer;
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: "networkidle0" });
      pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
          top: "1.5cm",
          bottom: "1.5cm",
          left: "1.5cm",
          right: "1.5cm",
        },
        printBackground: true,
      });
      await browser.close();

      // Tulis file ke disk
      fs.writeFileSync(pdfPath, pdfBuffer);
    } catch (pdfErr: any) {
      console.error("[pdf] Gagal merender dengan Puppeteer:", pdfErr);
      return {
        status: "error",
        message: `Gagal merender PDF: ${pdfErr.message || pdfErr}`,
      };
    }

    // 4. Update path PDF di database
    await db
      .update(schema.rppDocuments)
      .set({ pdfPath })
      .where(eq(schema.rppDocuments.id, rppId));

    // 5. Kirim PDF ke Telegram via Bot API jika token terkonfigurasi
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      // Kirim ke Guru
      if (rpp.telegramUserId && rpp.telegramUserId !== "unknown") {
        try {
          const formData = new FormData();
          formData.append("chat_id", rpp.telegramUserId);
          formData.append(
            "caption",
            `Berikut adalah berkas PDF resmi RPP mata pelajaran *${rpp.subject}* kelas *${rpp.grade}* dengan topik "*${rpp.topic}*" yang telah Anda setujui.`
          );
          
          const filename = `RPP_${rpp.subject.replace(/[^a-zA-Z0-9]/g, "_")}_${rpp.grade.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
          formData.append(
            "document",
            new Blob([new Uint8Array(pdfBuffer)]),
            filename
          );

          const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
            method: "POST",
            body: formData,
          });
          const resData = (await res.json()) as any;
          if (!resData.ok) {
            console.error("[telegram] Gagal mengirim dokumen ke guru:", resData.description);
          }
        } catch (tgErr) {
          console.error("[telegram] Terjadi error saat mengirim dokumen ke guru:", tgErr);
        }
      }

      // Kirim ke Channel Arsip Sekolah
      const archiveChannelId = process.env.TELEGRAM_ARCHIVE_CHANNEL_ID;
      if (archiveChannelId) {
        try {
          const formData = new FormData();
          formData.append("chat_id", archiveChannelId);
          formData.append(
            "caption",
            `[ARSIP RPP RESMI]\n\n• Sekolah: ${rpp.schoolName}\n• Guru: ${rpp.teacherName}\n• Mata Pelajaran: ${rpp.subject}\n• Kelas: ${rpp.grade}\n• Topik: ${rpp.topic}\n• Tahun Ajaran: ${rpp.academicYear}`
          );
          
          const filename = `RPP_ARSIP_${rpp.subject.replace(/[^a-zA-Z0-9]/g, "_")}_${rpp.grade.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
          formData.append(
            "document",
            new Blob([new Uint8Array(pdfBuffer)]),
            filename
          );

          const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
            method: "POST",
            body: formData,
          });
          const resData = (await res.json()) as any;
          if (!resData.ok) {
            console.error("[telegram] Gagal mengarsipkan dokumen ke channel:", resData.description);
          }
        } catch (archiveErr) {
          console.error("[telegram] Terjadi error saat mengarsipkan dokumen ke channel:", archiveErr);
        }
      }
    }

    return {
      status: "success",
      pdfPath,
      message: `PDF berhasil diekspor dan dikirimkan ke Telegram. Path berkas: ${pdfPath}`,
    };
  },
});
