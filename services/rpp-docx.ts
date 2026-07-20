import { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import type { RppDraft } from "../domain/rpp.js";

const bullets = (items: string[]) => items.map((item) => new Paragraph({ text: item, bullet: { level: 0 } }));
const heading = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) => new Paragraph({ text, heading: level });
const metadataRow = (label: string, value: string) => new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })] }), new TableCell({ children: [new Paragraph(value)] })] });

export async function renderRppDocx(draft: RppDraft): Promise<Buffer> {
  const document = new Document({
    sections: [{
      children: [
        new Paragraph({ text: draft.schoolName, heading: HeadingLevel.TITLE }),
        new Paragraph({ text: "RENCANA PELAKSANAAN PEMBELAJARAN" }),
        new Paragraph({ children: [new TextRun({ text: `Tahun Ajaran ${draft.academicYear}`, italics: true })] }),
        heading("Informasi Umum", HeadingLevel.HEADING_1),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [metadataRow("Guru Mata Pelajaran", draft.teacherName), metadataRow("Kepala Sekolah", draft.headmasterName), metadataRow("Mata Pelajaran", draft.subject), metadataRow("Kelas", draft.grade), metadataRow("Topik", draft.topic)] }),
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
        new Paragraph({ text: "", spacing: { after: 800 } }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: "Mengetahui,\nKepala Sekolah", alignment: "center" as any, spacing: { after: 1000 } }), new Paragraph({ text: draft.headmasterName, alignment: "center" as any })] }), new TableCell({ children: [new Paragraph({ text: `Jakarta, ${new Date().toLocaleDateString("id-ID")}\nGuru Mata Pelajaran`, alignment: "center" as any, spacing: { after: 1000 } }), new Paragraph({ text: draft.teacherName, alignment: "center" as any })] })] })] }),
      ],
    }],
  });

  return Buffer.from(await Packer.toBuffer(document));
}
