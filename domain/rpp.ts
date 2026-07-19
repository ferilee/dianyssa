import { z } from "zod";

const nonEmpty = z.string().trim().min(1);

export const rppDraftSchema = z.object({
  teacherName: nonEmpty,
  headmasterName: nonEmpty,
  schoolName: nonEmpty,
  academicYear: nonEmpty,
  subject: nonEmpty,
  grade: nonEmpty,
  topic: nonEmpty,
  identification: z.object({
    learnerProfile: nonEmpty,
    materialAnalysis: nonEmpty,
    graduateProfileDimensions: z.array(nonEmpty).min(1),
  }),
  design: z.object({
    learningObjectives: z.array(nonEmpty).min(1),
    pedagogicalPractice: nonEmpty,
    learningEnvironment: nonEmpty,
    learningPartnership: nonEmpty,
    digitalUtilization: nonEmpty,
  }),
  learningExperience: z.object({
    opening: z.array(nonEmpty).min(1),
    understanding: z.array(nonEmpty).min(1),
    applying: z.array(nonEmpty).min(1),
    reflecting: z.array(nonEmpty).min(1),
    closing: z.array(nonEmpty).min(1),
  }),
  assessments: z.object({
    initial: z.array(nonEmpty).min(1),
    process: z.array(nonEmpty).min(1),
    final: z.array(nonEmpty).min(1),
  }),
});

export type RppDraft = z.infer<typeof rppDraftSchema>;

function section(title: string, items: string[]): string {
  return `## ${title}\n${items.map((item) => `- ${item}`).join("\n")}`;
}

export function rppDraftToMarkdown(draft: RppDraft): string {
  return [
    "# Rencana Pelaksanaan Pembelajaran",
    `**Mata Pelajaran:** ${draft.subject}`,
    `**Kelas:** ${draft.grade}`,
    `**Topik:** ${draft.topic}`,
    "## Identifikasi",
    `**Profil Peserta Didik:** ${draft.identification.learnerProfile}`,
    `**Analisis Materi:** ${draft.identification.materialAnalysis}`,
    `**Dimensi Profil Lulusan:** ${draft.identification.graduateProfileDimensions.join(", ")}`,
    "## Desain Pembelajaran",
    section("Tujuan Pembelajaran", draft.design.learningObjectives),
    `**Praktik Pedagogis:** ${draft.design.pedagogicalPractice}`,
    `**Lingkungan Pembelajaran:** ${draft.design.learningEnvironment}`,
    `**Kemitraan Pembelajaran:** ${draft.design.learningPartnership}`,
    `**Pemanfaatan Digital:** ${draft.design.digitalUtilization}`,
    "## Pengalaman Belajar",
    section("Kegiatan Awal", draft.learningExperience.opening),
    section("Memahami", draft.learningExperience.understanding),
    section("Mengaplikasi", draft.learningExperience.applying),
    section("Merefleksi", draft.learningExperience.reflecting),
    section("Penutup", draft.learningExperience.closing),
    "## Asesmen Pembelajaran",
    section("Asesmen Awal", draft.assessments.initial),
    section("Asesmen Proses", draft.assessments.process),
    section("Asesmen Akhir", draft.assessments.final),
  ].join("\n\n");
}
