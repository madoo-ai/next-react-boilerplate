import type { Permission } from "@/lib/rbac/permissions";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    label: string;
  } | null;
  permissions: Permission[];
};

export type SessionUserWithProfile = SessionUser & {
  emailVerified: boolean;
  image: string | null;
  status: "pending" | "active" | "suspended";
  phoneNumber: string | null;
  jobTitle: string | null;
  department: string | null;
  twoFactorEnabled: boolean;
};
