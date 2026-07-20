import { z } from "zod";

export const organizationRoleSchema = z.enum(["platform_admin", "school_admin", "teacher"]);
export type OrganizationRole = z.infer<typeof organizationRoleSchema>;

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(250),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
});

export function canManageOrganization(role: OrganizationRole): boolean {
  return role === "platform_admin" || role === "school_admin";
}
