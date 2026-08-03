export type RppExportFormat = "docx" | "pdf";

/**
 * Only recognise explicit final approval commands. A phrase such as
 * "ya, saya setuju" can still be an answer to a clarification question in
 * the RPP-writing flow, so it must remain available to the agent.
 */
export function parseRppFinalApproval(text: string): RppExportFormat | null {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, " ");

  if (normalized === "setuju" || normalized === "cetak" || normalized === "cetak docx") {
    return "docx";
  }

  if (normalized === "cetak pdf") {
    return "pdf";
  }

  return null;
}
