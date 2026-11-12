import { z } from "zod";

export const roleNameSchema = z
  .string()
  .trim()
  .min(2, "validation.required")
  .max(60, "validation.max")
  .regex(/^[a-z0-9_]+$/, "validation.roleName");

export const roleSchema = z.object({
  name: roleNameSchema,
  label: z
    .string()
    .trim()
    .min(1, "validation.required")
    .max(80, "validation.max"),
  description: z.string().trim().max(240).optional().or(z.literal("")),
  permissions: z.array(z.string()),
});

export const createRoleSchema = roleSchema;
export const updateRoleSchema = roleSchema.extend({
  id: z.string().min(1),
});

export const deleteRoleSchema = z.object({
  id: z.string().min(1),
});

export type RoleInput = z.infer<typeof roleSchema>;
