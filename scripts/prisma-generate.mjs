/**
 * Ensures DATABASE_URL / DIRECT_URL exist so `prisma generate` works on
 * Vercel/CI even when DB secrets aren't injected at install time.
 * Runtime still needs real URLs set in the host environment.
 */
import { spawnSync } from "node:child_process";

const placeholder =
  "postgresql://build:build@127.0.0.1:5432/build?sslmode=disable";

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || placeholder,
  DIRECT_URL:
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL ||
    placeholder,
};

const result = spawnSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  env,
  shell: true,
});

process.exit(result.status ?? 1);
