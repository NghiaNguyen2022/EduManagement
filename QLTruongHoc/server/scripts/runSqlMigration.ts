import fs from "node:fs";
import path from "node:path";

import mysql from "mysql2/promise";

import { env } from "../config/env.js";

const migrationArgument = process.argv[2];

if (!migrationArgument || !/^\d{3}_[a-z0-9_]+\.sql$/i.test(migrationArgument)) {
  throw new Error("Cách dùng: node --import tsx server/scripts/runSqlMigration.ts 027_ten_file.sql");
}

const databaseDirectory = path.resolve(process.cwd(), "database");
const migrationPath = path.resolve(databaseDirectory, migrationArgument);

if (path.dirname(migrationPath) !== databaseDirectory || !fs.existsSync(migrationPath)) {
  throw new Error(`Không tìm thấy migration hợp lệ: ${migrationArgument}`);
}

const connection = await mysql.createConnection({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
  charset: "utf8mb4",
  multipleStatements: true,
});

try {
  const sql = fs.readFileSync(migrationPath, "utf8");
  await connection.query(sql);
  console.log(`Đã áp dụng migration ${migrationArgument}.`);
} finally {
  await connection.end();
}
