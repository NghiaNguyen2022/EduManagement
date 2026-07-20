import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";

const projectRoot = process.cwd();
const envLocalPath = path.resolve(
  projectRoot,
  ".env.local",
);
const envPath = path.resolve(
  projectRoot,
  ".env",
);

if (fs.existsSync(envLocalPath)) {
  const result = dotenv.config({
    path: envLocalPath,
    override: true,
  });

  if (result.error) {
    throw new Error(
      `Không thể đọc .env.local: ${result.error.message}`,
    );
  }
} else if (fs.existsSync(envPath)) {
  const result = dotenv.config({
    path: envPath,
    override: false,
  });

  if (result.error) {
    throw new Error(
      `Không thể đọc .env: ${result.error.message}`,
    );
  }
}

function getRequiredEnv(
  name: string,
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Thiếu biến môi trường bắt buộc: ${name}. ` +
        `Đã tìm cấu hình tại: ${envLocalPath}`,
    );
  }

  return value;
}

function getPositiveIntegerEnv(
  name: string,
  fallback: number,
): number {
  const rawValue =
    process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  if (
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(
      `Biến môi trường ${name} phải là số nguyên dương.`,
    );
  }

  return value;
}

export const env = {
  nodeEnv:
    process.env.NODE_ENV?.trim() ||
    "development",

  port: getPositiveIntegerEnv(
    "PORT",
    3100,
  ),

  database: {
    host: getRequiredEnv(
      "DATABASE_HOST",
    ),

    port: getPositiveIntegerEnv(
      "DATABASE_PORT",
      3306,
    ),

    user: getRequiredEnv(
      "DATABASE_USER",
    ),

    password: getRequiredEnv(
      "DATABASE_PASSWORD",
    ),

    name: getRequiredEnv(
      "DATABASE_NAME",
    ),
  },
} as const;

export const envPaths = {
  projectRoot,
  envLocalPath,
  envPath,
} as const;
