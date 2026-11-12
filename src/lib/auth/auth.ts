import "server-only";

import { APIError } from "better-auth/api";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins/two-factor";
import { ulid } from "ulid";

import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { sendAuthEmail } from "@/lib/mail/send-auth-email";

async function isRegistrationApprovalRequired() {
  const setting = await prisma.setting.findUnique({
    where: { key: "registration_approval" },
    select: { value: true },
  });

  return setting?.value === "true";
}

async function getDefaultRoleId() {
  const role = await prisma.role.findUnique({
    where: { name: "user" },
    select: { id: true },
  });

  return role?.id ?? null;
}

export const auth = betterAuth({
  appName: env.NEXT_PUBLIC_APP_NAME,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    cookiePrefix: "next-boilerplate",
    useSecureCookies: env.NODE_ENV === "production",
    database: {
      generateId: () => ulid(),
    },
  },
  user: {
    additionalFields: {
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
      roleId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        name: user.name,
        url,
        type: "reset-password",
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        name: user.name,
        url,
        type: "verify-email",
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: "compact",
    },
  },
  rateLimit: {
    enabled: env.NODE_ENV !== "test" && process.env.E2E !== "1",
    window: 60,
    max: 20,
    storage: "memory",
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const [approvalRequired, defaultRoleId] = await Promise.all([
            isRegistrationApprovalRequired(),
            getDefaultRoleId(),
          ]);

          return {
            data: {
              ...user,
              status: approvalRequired ? "pending" : "active",
              roleId: (user.roleId as string | undefined) ?? defaultRoleId,
            },
          };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { status: true },
          });

          if (!user) {
            throw new APIError("UNAUTHORIZED", {
              message: "ACCOUNT_NOT_FOUND",
            });
          }

          if (user.status === "pending") {
            throw new APIError("FORBIDDEN", {
              message: "ACCOUNT_PENDING",
            });
          }

          if (user.status === "suspended") {
            throw new APIError("FORBIDDEN", {
              message: "ACCOUNT_SUSPENDED",
            });
          }
        },
      },
    },
  },
  plugins: [
    twoFactor({
      issuer: env.NEXT_PUBLIC_APP_NAME,
      totpOptions: { digits: 6, period: 30 },
      backupCodeOptions: { amount: 10, length: 10 },
    }),
    nextCookies(),
  ],
});

export type Auth = typeof auth;
export type AuthSession = typeof auth.$Infer.Session;
