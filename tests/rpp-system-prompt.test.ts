import { describe, expect, it } from "bun:test";
import { RPP_SYSTEM_PROMPT } from "../server/rpp/system-prompt";

describe("RPP_SYSTEM_PROMPT", () => {
  it("requires persistence before a final approval prompt", () => {
    expect(RPP_SYSTEM_PROMPT).toContain("Segera panggil aksi `generate-rpp`");
    expect(RPP_SYSTEM_PROMPT).toContain("Hanya setelah aksi `generate-rpp` berhasil");
    expect(RPP_SYSTEM_PROMPT).toContain("Cetak DOCX");
  });
});
