import { describe, expect, it } from "bun:test";
import { rppDraftSchema, rppDraftToMarkdown } from "../domain/rpp";

const draft = {
  teacherName: "Ibu Sari",
  headmasterName: "Bapak Budi",
  schoolName: "SD Harapan",
  academicYear: "2026/2027",
  subject: "IPA",
  grade: "Kelas 5",
  topic: "Ekosistem",
  identification: {
    learnerProfile: "Siswa mengenal lingkungan sekitar.",
    materialAnalysis: "Interaksi makhluk hidup dan lingkungannya.",
    graduateProfileDimensions: ["Penalaran Kritis", "Kolaborasi"],
  },
  design: {
    learningObjectives: ["Menjelaskan komponen ekosistem."],
    pedagogicalPractice: "Pembelajaran berbasis proyek.",
    learningEnvironment: "Kelas dan kebun sekolah.",
    learningPartnership: "Orang tua dan komunitas sekolah.",
    digitalUtilization: "Video pembelajaran.",
  },
  learningExperience: {
    opening: ["Mengamati gambar ekosistem."],
    understanding: ["Membuat peta konsep."],
    applying: ["Mengamati kebun sekolah."],
    reflecting: ["Menulis refleksi."],
    closing: ["Menyimpulkan pembelajaran."],
  },
  assessments: {
    initial: ["Pertanyaan pemantik."],
    process: ["Observasi kolaborasi."],
    final: ["Presentasi proyek."],
  },
};

describe("RPP domain", () => {
  it("validates a complete deep-learning RPP and renders deterministic markdown", () => {
    const parsed = rppDraftSchema.parse(draft);
    const markdown = rppDraftToMarkdown(parsed);

    expect(markdown).toContain("## Pengalaman Belajar");
    expect(markdown).toContain("## Memahami");
    expect(markdown).toContain("Penalaran Kritis, Kolaborasi");
  });

  it("requires at least one graduate profile dimension", () => {
    expect(() => rppDraftSchema.parse({
      ...draft,
      identification: { ...draft.identification, graduateProfileDimensions: [] },
    })).toThrow();
  });
});
