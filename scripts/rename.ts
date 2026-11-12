import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const [displayName, slug] = process.argv.slice(2);

if (!displayName || !slug) {
  console.error('Usage: npm run rename -- "Client App" client-app');
  process.exit(1);
}

if (!/^[a-z0-9][a-z0-9-_]*$/.test(slug)) {
  console.error(
    "The slug must start with a lowercase letter or number and contain only lowercase letters, numbers, dashes or underscores.",
  );
  process.exit(1);
}

const root = process.cwd();

async function updateFile(
  path: string,
  transform: (content: string) => string,
) {
  const absolute = resolve(root, path);

  if (!existsSync(absolute)) return;

  const content = await readFile(absolute, "utf8");
  const next = transform(content);

  if (next !== content) {
    await writeFile(absolute, next, "utf8");
    console.log(`updated ${path}`);
  }
}

function replaceAppName(content: string, value: string) {
  return content
    .replace(/^NEXT_PUBLIC_APP_NAME=.*$/m, `NEXT_PUBLIC_APP_NAME="${value}"`)
    .replace(/"Next React Boilerplate"/g, JSON.stringify(value));
}

await updateFile("package.json", (content) => {
  const packageJson = JSON.parse(content) as {
    name?: string;
  };
  packageJson.name = slug;
  return `${JSON.stringify(packageJson, null, 2)}\n`;
});

await updateFile("package-lock.json", (content) => {
  const lockfile = JSON.parse(content) as {
    name?: string;
    packages?: Record<string, { name?: string }>;
  };
  lockfile.name = slug;
  if (lockfile.packages?.[""]) {
    lockfile.packages[""].name = slug;
  }
  return `${JSON.stringify(lockfile, null, 2)}\n`;
});

await updateFile("src/config/app.ts", (content) =>
  replaceAppName(content, displayName),
);

await updateFile("src/messages/en.json", (content) =>
  content.replace(
    /"appName": ".*"/,
    `"appName": ${JSON.stringify(displayName)}`,
  ),
);

await updateFile("src/messages/id.json", (content) =>
  content.replace(
    /"appName": ".*"/,
    `"appName": ${JSON.stringify(displayName)}`,
  ),
);

await updateFile(".env.example", (content) =>
  replaceAppName(content, displayName),
);

await updateFile(".env", (content) => replaceAppName(content, displayName));

await updateFile("README.md", (content) =>
  content.replace(/^# .+$/m, `# ${displayName}`),
);

await updateFile("Dockerfile", (content) =>
  content.replace(
    /ARG NEXT_PUBLIC_APP_NAME=".*"/,
    `ARG NEXT_PUBLIC_APP_NAME=${JSON.stringify(displayName)}`,
  ),
);

await updateFile("compose.yaml", (content) =>
  content.replace(
    /\$\{NEXT_PUBLIC_APP_NAME:-[^}]*\}/g,
    `\${NEXT_PUBLIC_APP_NAME:-${displayName}}`,
  ),
);

console.log(`Renamed to "${displayName}" (${slug}).`);
