import "dotenv/config";

import { execFileSync } from "node:child_process";
import { Client } from "pg";

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/next_boilerplate_test?schema=public";

export default async function globalSetup() {
  const env = {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
  };

  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env,
  });

  const client = new Client({ connectionString: testDatabaseUrl });
  await client.connect();

  try {
    await client.query("DELETE FROM users WHERE email LIKE 'e2e-%'");
    await client.query(
      "DELETE FROM roles WHERE name ~ '^e2e_' AND is_system = false",
    );
    await client.query(
      "UPDATE settings SET value = 'false' WHERE key = 'registration_approval'",
    );
    await client.query(
      "UPDATE users SET name = 'Super Admin' WHERE email = 'superadmin@example.com'",
    );
  } finally {
    await client.end();
  }

  execFileSync("npx", ["prisma", "db", "seed"], {
    stdio: "inherit",
    env,
  });
}
