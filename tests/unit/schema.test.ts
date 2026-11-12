import { describe, expect, it } from "vitest";

import { roleSchema } from "@/lib/roles/schema";
import { profileSchema } from "@/lib/settings/schema";
import {
  createUserSchema,
  updateUserSchema,
  userFiltersSchema,
} from "@/lib/users/schema";

const validUser = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "08123456789",
  jobTitle: "Engineer",
  department: "Engineering",
  role: "user",
  status: "active" as const,
};

describe("user schemas", () => {
  it("accepts a valid create payload", () => {
    const result = createUserSchema.safeParse({
      ...validUser,
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a short create password", () => {
    const result = createUserSchema.safeParse({
      ...validUser,
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("allows an empty password on update", () => {
    const result = updateUserSchema.safeParse({
      ...validUser,
      id: "01H00000000000000000000000",
      password: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a short update password", () => {
    const result = updateUserSchema.safeParse({
      ...validUser,
      id: "01H00000000000000000000000",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("coerces and clamps filters", () => {
    const filters = userFiltersSchema.parse({
      page: "2",
      search: " ada ",
      role: "user",
      status: "active",
    });

    expect(filters.page).toBe(2);
    expect(filters.search).toBe("ada");
    expect(filters.status).toBe("active");
  });
});

describe("role schema", () => {
  it("accepts a valid role", () => {
    const result = roleSchema.safeParse({
      name: "support_lead",
      label: "Support Lead",
      description: "Handles support.",
      permissions: ["view_admin"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a role name with spaces", () => {
    const result = roleSchema.safeParse({
      name: "Support Lead",
      label: "Support Lead",
      description: "",
      permissions: [],
    });

    expect(result.success).toBe(false);
  });
});

describe("profile schema", () => {
  it("accepts a valid profile", () => {
    const result = profileSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "",
      jobTitle: "",
      department: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = profileSchema.safeParse({
      name: "Ada Lovelace",
      email: "not-an-email",
      phone: "",
      jobTitle: "",
      department: "",
    });

    expect(result.success).toBe(false);
  });
});
