/**
 * Membuat slug URL dari judul artikel (digunakan untuk blog)
 * - Lowercase semua
 * - Hanya huruf, angka, spasi, dan dash
 * - Spasi diganti dash
 * - Multiple dash diganti single dash
 */

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}