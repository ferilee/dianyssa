export function generateExcerpt(content: string, maxLength = 160): string {
  const firstParagraph = content.split(/\n\s*\n/)[0] ?? "";
  const plain = firstParagraph.replace(/[#*_`]/g, "").trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trimEnd() + "…";
}