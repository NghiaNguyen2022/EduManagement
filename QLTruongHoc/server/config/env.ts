import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${name}`);
  }

  return value;
}

function getPositiveIntegerEnv(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`Biến môi trường ${name} không hợp lệ: ${rawValue}`);
  }

  return parsedValue;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: getPositiveIntegerEnv("PORT", 3000),

  database: {
    host: process.env.DATABASE_HOST?.trim() || "localhost",
    port: getPositiveIntegerEnv("DATABASE_PORT", 3306),
    user: getRequiredEnv("DATABASE_USER"),
    password: getRequiredEnv("DATABASE_PASSWORD"),
    name: getRequiredEnv("DATABASE_NAME"),
    connectionLimit: 10
  },

  jwtSecret: getRequiredEnv("JWT_SECRET")
};
