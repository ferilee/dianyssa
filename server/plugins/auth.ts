import { createAuthPlugin } from "@agent-native/core/server";
import { RPP_PORTAL_PUBLIC_PATHS } from "../auth/portal-routes.js";

export default createAuthPlugin({
  publicPaths: [...RPP_PORTAL_PUBLIC_PATHS],
  marketing: {
    appName: "RPP Bot",
    tagline:
      "Telegram Bot Pembuat RPP PDF menggunakan Kurikulum Pembelajaran Mendalam.",
    features: [
      "Pembuatan RPP berbasis AI yang terintegrasi dengan Bot Telegram",
      "Kepatuhan pada format resmi Kurikulum Pembelajaran Mendalam",
      "Pencetakan berkas dokumen PDF berkualitas tinggi via Puppeteer",
      "Dasbor minimalis untuk memantau riwayat dan mengunduh ulang PDF RPP"
    ],
  },
});
