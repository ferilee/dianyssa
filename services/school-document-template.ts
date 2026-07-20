import { and, eq } from "drizzle-orm";
import { getDb, schema } from "../server/db/index.js";

export type SchoolDocumentTemplate = {
  letterheadText?: string;
  city: string;
  headmasterNip?: string;
  teacherNip?: string;
};

export const defaultSchoolDocumentTemplate: SchoolDocumentTemplate = {
  city: "Jakarta",
};

export function schoolDocumentTemplateId(organizationId: string, schoolName: string): string {
  return `${organizationId}:${schoolName}`;
}

export function normalizeSchoolDocumentTemplate(
  template?: Partial<Record<keyof SchoolDocumentTemplate, string | null | undefined>> | null,
): SchoolDocumentTemplate {
  const clean = (value?: string | null) => value?.trim() || undefined;
  return {
    letterheadText: clean(template?.letterheadText),
    city: clean(template?.city) ?? defaultSchoolDocumentTemplate.city,
    headmasterNip: clean(template?.headmasterNip),
    teacherNip: clean(template?.teacherNip),
  };
}

export async function resolveSchoolDocumentTemplate(organizationId: string, schoolName: string): Promise<SchoolDocumentTemplate> {
  const [template] = await getDb()
    .select()
    .from(schema.schoolDocumentTemplates)
    .where(and(eq(schema.schoolDocumentTemplates.organizationId, organizationId), eq(schema.schoolDocumentTemplates.schoolName, schoolName)))
    .limit(1);

  return normalizeSchoolDocumentTemplate(template);
}
