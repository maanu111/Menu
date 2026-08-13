import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The platform owns the schema. This copies it in and rewrites only the
 * generator output path, so the guest app and the dashboards can never drift
 * apart on what a table or an order is.
 */
const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, "../../SAAS/prisma/schema.prisma");
const target = resolve(here, "../prisma/schema.prisma");

let schema;
try {
  schema = readFileSync(source, "utf8");
} catch {
  console.error(
    `Could not read ${source}\n` +
      "MENUQR generates its client from the SAAS schema — keep both repos side by side under RESTAU.",
  );
  process.exit(1);
}

const rewritten = schema.replace(
  /output\s*=\s*"[^"]*"/,
  'output   = "../src/generated/prisma"',
);

mkdirSync(dirname(target), { recursive: true });
writeFileSync(
  target,
  `// GENERATED — do not edit. Source of truth: SAAS/prisma/schema.prisma\n// Run \`pnpm db:generate\` after changing it there.\n\n${rewritten}`,
);

console.log("✓ schema synced from SAAS");