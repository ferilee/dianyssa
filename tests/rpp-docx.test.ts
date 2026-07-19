import { describe, expect, it } from "bun:test";
import { rppDraftSchema } from "../domain/rpp";
import { renderRppDocx } from "../services/rpp-docx";

describe("RPP DOCX renderer", () => {
  it("creates a DOCX zip archive from a validated RPP", async () => {
    const draft = rppDraftSchema.parse({
      teacherName: "Ibu Sari", headmasterName: "Bapak Budi", schoolName: "SD Harapan", academicYear: "2026/2027", subject: "IPA", grade: "Kelas 5", topic: "Ekosistem",
      identification: { learnerProfile: "Siswa", materialAnalysis: "Ekosistem", graduateProfileDimensions: ["Kolaborasi"] },
      design: { learningObjectives: ["Menjelaskan ekosistem."], pedagogicalPractice: "PjBL", learningEnvironment: "Kelas", learningPartnership: "Komunitas", digitalUtilization: "Video" },
      learningExperience: { opening: ["Apersepsi"], understanding: ["Peta konsep"], applying: ["Observasi"], reflecting: ["Refleksi"], closing: ["Simpulan"] },
      assessments: { initial: ["Tanya jawab"], process: ["Observasi"], final: ["Presentasi"] },
    });
    const buffer = await renderRppDocx(draft);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
    expect(buffer.length).toBeGreaterThan(1000);
  });
});
