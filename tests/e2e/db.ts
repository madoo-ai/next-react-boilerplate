import "dotenv/config";

import { Client } from "pg";

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/next_boilerplate_test?schema=public";

async function withClient(
  callback: (client: Client) => Promise<void>,
): Promise<void> {
  const client = new Client({ connectionString: testDatabaseUrl });
  await client.connect();

  try {
    await callback(client);
  } finally {
    await client.end();
  }
}

export async function deleteUsersByEmail(emails: string[]) {
  if (emails.length === 0) return;

  await withClient(async (client) => {
    await client.query("DELETE FROM users WHERE email = ANY($1)", [emails]);
  });
}

export async function deleteRoleByName(name: string) {
  await withClient(async (client) => {
    await client.query(
      "DELETE FROM roles WHERE name = $1 AND is_system = false",
      [name],
    );
  });
}

export async function resetSuperadminName() {
  await withClient(async (client) => {
    await client.query(
      "UPDATE users SET name = 'Super Admin' WHERE email = 'superadmin@example.com'",
    );
  });
}

export async function resetRegistrationApproval() {
  await withClient(async (client) => {
    await client.query(
      "UPDATE settings SET value = 'false' WHERE key = 'registration_approval'",
    );
  });
}
