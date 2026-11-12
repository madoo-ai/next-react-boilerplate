import { z } from "zod";

export const USERS_PAGE_SIZE = 10;

export const userStatusSchema = z.enum(["pending", "active", "suspended"]);

export const userFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  search: z.string().trim().max(120).optional().catch(undefined),
  role: z.string().trim().max(60).optional().catch(undefined),
  status: userStatusSchema.optional().catch(undefined),
});

export type UserFilters = z.infer<typeof userFiltersSchema>;

const profileFields = {
  name: z
    .string()
    .trim()
    .min(2, "validation.nameLength")
    .max(120, "validation.nameLength"),
  email: z.email("validation.email"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  department: z.string().trim().max(120).optional().or(z.literal("")),
  role: z.string().trim().min(1, "validation.invalidRole"),
  status: userStatusSchema,
};

export const createUserSchema = z.object({
  ...profileFields,
  password: z
    .string()
    .min(8, "validation.passwordLength")
    .max(128, "validation.passwordLength"),
});

export const updateUserSchema = z.object({
  ...profileFields,
  id: z.string().min(1),
  password: z
    .union([
      z.literal(""),
      z
        .string()
        .min(8, "validation.passwordLength")
        .max(128, "validation.passwordLength"),
    ])
    .optional(),
});

export const userIdSchema = z.object({
  id: z.string().min(1),
});

export const registrationApprovalSchema = z.object({
  enabled: z.boolean(),
});

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseUserFilters(
  searchParams: Record<string, string | string[] | undefined>,
): UserFilters {
  return userFiltersSchema.parse({
    page: firstParam(searchParams.page) ?? "1",
    search: firstParam(searchParams.search),
    role: firstParam(searchParams.role),
    status: firstParam(searchParams.status),
  });
}
