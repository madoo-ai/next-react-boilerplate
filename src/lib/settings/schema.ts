import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "validation.nameLength")
    .max(120, "validation.nameLength"),
  email: z.email("validation.email"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  department: z.string().trim().max(120).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
