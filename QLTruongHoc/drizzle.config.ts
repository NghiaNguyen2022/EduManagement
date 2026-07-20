import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error(
    "Thiếu DATABASE_URL trong .env.local hoặc biến môi trường hệ thống.",
  );
}

export default defineConfig({
  dialect: "mysql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",

  dbCredentials: {
    url: databaseUrl,
  },

  verbose: true,
  strict: true,
});
