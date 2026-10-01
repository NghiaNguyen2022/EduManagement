import type { RowDataPacket } from "mysql2";
import { execute, queryRows } from "../db/mysql";
import { hashPassword, verifyPassword } from "../auth/password";

export type AdminUser = {
  username: string;
  passwordHash: string;
  salt: string;
  iterations: number;
  createdAt: string;
};

type AdminRow = RowDataPacket & {
  username: string;
  password_hash: string;
  salt: string;
  iterations: number;
  created_at: Date;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const rows = await queryRows<AdminRow[]>(
    "SELECT username, password_hash, salt, iterations, created_at FROM admin_users LIMIT 1",
  );
  const row = rows[0];
  return row
    ? {
        username: row.username,
        passwordHash: row.password_hash,
        salt: row.salt,
        iterations: row.iterations,
        createdAt: row.created_at.toISOString(),
      }
    : null;
}

export async function adminExists(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}

export async function createAdminUser(username: string, password: string): Promise<AdminUser> {
  const { salt, hash, iterations } = await hashPassword(password);
  const createdAt = new Date();
  await execute(
    "INSERT INTO admin_users (username, password_hash, salt, iterations, created_at) VALUES (?, ?, ?, ?, ?)",
    [username, hash, salt, iterations, createdAt],
  );
  return {
    username,
    passwordHash: hash,
    salt,
    iterations,
    createdAt: createdAt.toISOString(),
  };
}

export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const user = await getAdminUser();
  if (!user || user.username !== username) return false;
  return verifyPassword(password, user.salt, user.passwordHash, user.iterations);
}
