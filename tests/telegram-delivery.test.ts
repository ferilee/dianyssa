import { describe, expect, it } from "bun:test";
import { sendTelegramDocument } from "../services/telegram-delivery";

describe("Telegram delivery adapter", () => {
  it("sends a document through an injectable Telegram request", async () => {
    let url = "";
    const request = async (input: string | URL | Request) => { url = String(input); return new Response(JSON.stringify({ ok: true }), { status: 200 }); };
    await sendTelegramDocument({ token: "test-token", chatId: "1001", caption: "RPP", filename: "rpp.docx", content: Buffer.from("docx") }, request as typeof fetch);
    expect(url).toBe("https://api.telegram.org/bottest-token/sendDocument");
  });

  it("surfaces a mocked Telegram delivery failure", async () => {
    const request = async () => new Response(JSON.stringify({ ok: false, description: "blocked" }), { status: 200 });
    await expect(sendTelegramDocument({ token: "test", chatId: "1001", caption: "RPP", filename: "rpp.docx", content: Buffer.from("docx") }, request as typeof fetch)).rejects.toThrow("blocked");
  });
});
