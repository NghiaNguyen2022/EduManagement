import * as mysql from "mysql2/promise";
import * as schema from "../../drizzle/schema.js";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { drizzle } from "drizzle-orm/mysql2";

import { env } from "../config/env.js";

const pool = mysql.createPool({
      host: env.database.host,
      port: env.database.port,
      user: env.database.user,
      password: env.database.password,
      database: env.database.name,
      waitForConnections: true,
      connectionLimit: env.database.connectionLimit,
      queueLimit: 0,
      charset: "utf8mb4",
      timezone: "+07:00",
      dateStrings: true,
});

export const db: MySql2Database<typeof schema> = drizzle<typeof schema>(
      pool,
      {
            schema,
            mode: "default",
      },
);

export function getDb(): MySql2Database<typeof schema> {
      return db;
}

export async function checkDbConnection(): Promise<void> {
      const connection = await pool.getConnection();

      try {
            await connection.ping();
      } finally {
            connection.release();
      }
}

export async function getDbConnectionInfo(): Promise<unknown> {
      const [rows] = await pool.query(`
    SELECT
      DATABASE() AS databaseName,
      CURRENT_USER() AS currentUser,
      NOW() AS serverTime,
      @@session.time_zone AS sessionTimeZone
  `);

      return rows;
}

export async function closeDbConnection(): Promise<void> {
      await pool.end();
}