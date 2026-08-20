import "dotenv/config";
import { defineConfig } from "prisma/config";

const placeholder =
  "postgresql://build:build@127.0.0.1:5432/build?sslmode=disable";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Don't use env() — it throws when DATABASE_URL is missing on Vercel install.
    url: process.env.DATABASE_URL || placeholder,
  },
});
