import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { RppDraft } from "../domain/rpp.js";

const bullets = (items: string[]) => items.map((item) => new Paragraph({ text: item, bullet: { level: 0 } }));
const heading = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) => new Paragraph({ text, heading: level });

export async function renderRppDocx(draft: RppDraft): Promise<Buffer> {
  const document = new Document({
    sections: [{
      children: [
        new Paragraph({ text: draft.schoolName, heading: HeadingLevel.TITLE }),
        new Paragraph({ text: "RENCANA PELAKSANAAN PEMBELAJARAN" }),
        new Paragraph({ children: [new TextRun({ text: `Tahun Ajaran ${draft.academicYear}`, italics: true })] }),
        heading("Informasi Umum", HeadingLevel.HEADING_1),
        new Paragraph(`Guru Mata Pelajaran: ${draft.teacherName}`),
        new Paragraph(`Kepala Sekolah: ${draft.headmasterName}`),
        new Paragraph(`Mata Pelajaran: ${draft.subject}`),
        new Paragraph(`Kelas: ${draft.grade}`),
        new Paragraph(`Topik: ${draft.topic}`),
        heading("Identifikasi", HeadingLevel.HEADING_1),
        new Paragraph(`Profil Peserta Didik: ${draft.identification.learnerProfile}`),
        new Paragraph(`Analisis Materi: ${draft.identification.materialAnalysis}`),
        new Paragraph(`Dimensi Profil Lulusan: ${draft.identification.graduateProfileDimensions.join(", ")}`),
        heading("Desain Pembelajaran", HeadingLevel.HEADING_1),
        heading("Tujuan Pembelajaran", HeadingLevel.HEADING_2),
        ...bullets(draft.design.learningObjectives),
        new Paragraph(`Praktik Pedagogis: ${draft.design.pedagogicalPractice}`),
        new Paragraph(`Lingkungan Pembelajaran: ${draft.design.learningEnvironment}`),
        new Paragraph(`Kemitraan Pembelajaran: ${draft.design.learningPartnership}`),
        new Paragraph(`Pemanfaatan Digital: ${draft.design.digitalUtilization}`),
        heading("Pengalaman Belajar", HeadingLevel.HEADING_1),
        heading("Kegiatan Awal", HeadingLevel.HEADING_2), ...bullets(draft.learningExperience.opening),
        heading("Memahami", HeadingLevel.HEADING_2), ...bullets(draft.learningExperience.understanding),
        heading("Mengaplikasi", HeadingLevel.HEADING_2), ...bullets(draft.learningExperience.applying),
        heading("Merefleksi", HeadingLevel.HEADING_2), ...bullets(draft.learningExperience.reflecting),
        heading("Penutup", HeadingLevel.HEADING_2), ...bullets(draft.learningExperience.closing),
        heading("Asesmen Pembelajaran", HeadingLevel.HEADING_1),
        heading("Asesmen Awal", HeadingLevel.HEADING_2), ...bullets(draft.assessments.initial),
        heading("Asesmen Proses", HeadingLevel.HEADING_2), ...bullets(draft.assessments.process),
        heading("Asesmen Akhir", HeadingLevel.HEADING_2), ...bullets(draft.assessments.final),
      ],
    }],
  });

  return Buffer.from(await Packer.toBuffer(document));
}
