import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { ulid } from "ulid";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
} from "../src/lib/rbac/permissions";
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  ROLES,
  type RoleName,
} from "../src/lib/rbac/roles";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

type DemoUser = {
  name: string;
  email: string;
  role: RoleName;
  status: "active" | "pending" | "suspended";
  jobTitle: string;
  department: string;
};

const demoUsers: DemoUser[] = [
  {
    name: "Super Admin",
    email: "superadmin@example.com",
    role: ROLES.SUPERADMIN,
    status: "active",
    jobTitle: "Platform Owner",
    department: "Operations",
  },
  {
    name: "HR Staff",
    email: "hr@example.com",
    role: ROLES.HR,
    status: "active",
    jobTitle: "People Operations",
    department: "People",
  },
  {
    name: "Regular User",
    email: "user@example.com",
    role: ROLES.USER,
    status: "active",
    jobTitle: "Software Engineer",
    department: "Engineering",
  },
  {
    name: "Andi Pratama",
    email: "andi@example.com",
    role: ROLES.USER,
    status: "active",
    jobTitle: "Backend Engineer",
    department: "Engineering",
  },
  {
    name: "Siti Rahma",
    email: "siti@example.com",
    role: ROLES.HR,
    status: "active",
    jobTitle: "Recruiter",
    department: "People",
  },
  {
    name: "Budi Santoso",
    email: "budi@example.com",
    role: ROLES.USER,
    status: "active",
    jobTitle: "Finance Analyst",
    department: "Finance",
  },
  {
    name: "Dewi Lestari",
    email: "dewi@example.com",
    role: ROLES.USER,
    status: "active",
    jobTitle: "Product Designer",
    department: "Design",
  },
  {
    name: "Rizky Hidayat",
    email: "rizky@example.com",
    role: ROLES.USER,
    status: "active",
    jobTitle: "Account Executive",
    department: "Sales",
  },
  {
    name: "Maya Putri",
    email: "maya@example.com",
    role: ROLES.USER,
    status: "active",
    jobTitle: "Support Lead",
    department: "Support",
  },
  {
    name: "Fajar Nugroho",
    email: "fajar@example.com",
    role: ROLES.USER,
    status: "active",
    jobTitle: "Data Engineer",
    department: "Engineering",
  },
  {
    name: "Nabila Syah",
    email: "nabila@example.com",
    role: ROLES.USER,
    status: "pending",
    jobTitle: "Marketing Associate",
    department: "Marketing",
  },
  {
    name: "Agus Wijaya",
    email: "agus@example.com",
    role: ROLES.USER,
    status: "pending",
    jobTitle: "Operations Associate",
    department: "Operations",
  },
  {
    name: "Putri Anggraini",
    email: "putri@example.com",
    role: ROLES.USER,
    status: "pending",
    jobTitle: "QA Engineer",
    department: "Engineering",
  },
  {
    name: "Hendra Kusuma",
    email: "hendra@example.com",
    role: ROLES.USER,
    status: "suspended",
    jobTitle: "Sales Representative",
    department: "Sales",
  },
];

async function seedRbac() {
  const permissions = new Map<string, string>();

  for (const key of ALL_PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: {
        label: PERMISSION_LABELS[key],
      },
      create: {
        id: ulid(),
        key,
        label: PERMISSION_LABELS[key],
      },
    });

    permissions.set(key, permission.id);
  }

  const roles: Array<{
    name: RoleName;
    isSystem: boolean;
  }> = [
    { name: ROLES.SUPERADMIN, isSystem: true },
    { name: ROLES.HR, isSystem: false },
    { name: ROLES.USER, isSystem: false },
  ];

  const roleIds = new Map<string, string>();

  for (const definition of roles) {
    const role = await prisma.role.upsert({
      where: { name: definition.name },
      update: {
        label: ROLE_LABELS[definition.name],
        description: ROLE_DESCRIPTIONS[definition.name],
        isSystem: definition.isSystem,
      },
      create: {
        id: ulid(),
        name: definition.name,
        label: ROLE_LABELS[definition.name],
        description: ROLE_DESCRIPTIONS[definition.name],
        isSystem: definition.isSystem,
      },
    });

    roleIds.set(definition.name, role.id);

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    const permissionRows = ROLE_PERMISSIONS[definition.name]
      .map((key) => permissions.get(key))
      .filter((permissionId): permissionId is string => !!permissionId)
      .map((permissionId) => ({
        roleId: role.id,
        permissionId,
      }));

    if (permissionRows.length > 0) {
      await prisma.rolePermission.createMany({ data: permissionRows });
    }
  }

  await prisma.setting.upsert({
    where: { key: "registration_approval" },
    update: {},
    create: {
      id: ulid(),
      key: "registration_approval",
      value: "false",
    },
  });

  return roleIds;
}

async function seedUsers(roleIds: Map<string, string>) {
  const passwordHash = await hashPassword("password");
  const day = 24 * 60 * 60 * 1000;
  let created = 0;

  for (const [index, demo] of demoUsers.entries()) {
    const createdAt = new Date(Date.now() - (index * 2 + 1) * day);
    const existing = await prisma.user.findUnique({
      where: { email: demo.email },
      select: { id: true },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { createdAt },
      });
      continue;
    }

    const userId = ulid();
    const roleId = roleIds.get(demo.role);

    await prisma.user.create({
      data: {
        id: userId,
        name: demo.name,
        email: demo.email,
        emailVerified: demo.status === "active",
        status: demo.status,
        roleId,
        jobTitle: demo.jobTitle,
        department: demo.department,
        createdAt,
        accounts: {
          create: {
            id: ulid(),
            accountId: userId,
            providerId: "credential",
            password: passwordHash,
          },
        },
      },
    });

    created += 1;
  }

  return created;
}

async function main() {
  const roleIds = await seedRbac();
  const createdUsers = await seedUsers(roleIds);

  console.log(
    `Seed complete: ${ALL_PERMISSIONS.length} permissions, ${roleIds.size} roles, ${createdUsers} new users.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
