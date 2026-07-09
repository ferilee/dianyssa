import type { LoaderFunctionArgs } from "react-router";
import { getDb, schema } from "../../server/db/index.js";
import { eq } from "drizzle-orm";
import fs from "node:fs";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // 1. Cek sesi
  const cookieHeader = request.headers.get("Cookie");
  const sessionCookie = cookieHeader?.split(";").find((c) => c.trim().startsWith("session="));
  const telegramUserId = sessionCookie?.split("=")[1];

  if (!telegramUserId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const rppId = params.id;
  if (!rppId) {
    throw new Response("Bad Request", { status: 400 });
  }

  const db = getDb();

  // 2. Ambil data RPP
  const results = await db
    .select()
    .from(schema.rppDocuments)
    .where(eq(schema.rppDocuments.id, rppId))
    .limit(1);

  if (results.length === 0) {
    throw new Response("RPP Tidak Ditemukan", { status: 404 });
  }

  const rpp = results[0];

  // 3. Verifikasi Kepemilikan (Kecuali Admin)
  const userResults = await db
    .select()
    .from(schema.authorizedUsers)
    .where(eq(schema.authorizedUsers.telegramUserId, telegramUserId))
    .limit(1);

  const isAdmin = userResults[0]?.role === "admin";

  if (rpp.telegramUserId !== telegramUserId && !isAdmin) {
    throw new Response("Forbidden", { status: 403 });
  }

  // 4. Periksa apakah file PDF fisik ada di disk
  if (!rpp.pdfPath || !fs.existsSync(rpp.pdfPath)) {
    throw new Response("Berkas PDF belum dicetak atau tidak ditemukan di server.", { status: 404 });
  }

  // 5. Baca dan kirim file PDF
  const fileBuffer = fs.readFileSync(rpp.pdfPath);
  const cleanSubject = rpp.subject.replace(/[^a-zA-Z0-9]/g, "_");
  const cleanGrade = rpp.grade.replace(/[^a-zA-Z0-9]/g, "_");

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="RPP_${cleanSubject}_${cleanGrade}.pdf"`,
    },
  });
}
