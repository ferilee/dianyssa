import { describe, expect, it } from "bun:test";
import { parseRppFinalApproval } from "../server/rpp/approval-intent";

describe("parseRppFinalApproval", () => {
  it("accepts only explicit final export commands", () => {
    expect(parseRppFinalApproval("Setuju")).toBe("docx");
    expect(parseRppFinalApproval(" cetak DOCX ")).toBe("docx");
    expect(parseRppFinalApproval("cetak pdf")).toBe("pdf");
  });

  it("does not consume an agreement to an intermediate clarification", () => {
    expect(parseRppFinalApproval("ya, saya setuju")).toBeNull();
    expect(parseRppFinalApproval("setuju memakai konteks RPL")).toBeNull();
  });
});
