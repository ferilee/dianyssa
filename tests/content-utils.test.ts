import { describe, it, expect } from "bun:test";
import { generateSlug } from "../lib/slug";
import { generateExcerpt } from "../lib/excerpt";

describe("content utilities", () => {
  it("generates slug from title", () => {
    expect(generateSlug("Cara Belajar Efektif!")).toBe("cara-belajar-efektif");
  });

  it("generates excerpt from first paragraph", () => {
    const content = "Ini paragraf pertama.\n\nIni paragraf kedua.";
    expect(generateExcerpt(content)).toBe("Ini paragraf pertama.");
  });
});