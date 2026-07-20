export type TelegramFetch = typeof fetch;

export async function sendTelegramDocument(
  input: { token: string; chatId: string; caption: string; filename: string; content: Buffer },
  request: TelegramFetch = fetch,
): Promise<void> {
  const form = new FormData();
  form.append("chat_id", input.chatId);
  form.append("caption", input.caption);
  form.append("document", new Blob([new Uint8Array(input.content)]), input.filename);
  const response = await request(`https://api.telegram.org/bot${input.token}/sendDocument`, { method: "POST", body: form });
  const result = await response.json() as { ok?: boolean; description?: string };
  if (!response.ok || !result.ok) throw new Error(`Telegram delivery failed: ${result.description ?? "unknown error"}`);
}
