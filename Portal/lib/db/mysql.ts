import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;
  const { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;
  if (!MYSQL_HOST || !MYSQL_DATABASE || !MYSQL_USER) {
    throw new Error("Missing MySQL configuration. Set MYSQL_HOST, MYSQL_DATABASE and MYSQL_USER.");
  }
  pool = mysql.createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT || 3306),
    database: MYSQL_DATABASE,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD || "",
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4",
    timezone: "Z",
  });
  return pool;
}

export async function queryRows<T extends RowDataPacket[]>(
  sql: string,
  values: Array<string | number | boolean | Date | null> = [],
): Promise<T> {
  const [rows] = await getPool().execute<T>(sql, values);
  return rows;
}

export async function execute(
  sql: string,
  values: Array<string | number | boolean | Date | null> = [],
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, values);
  return result;
}
