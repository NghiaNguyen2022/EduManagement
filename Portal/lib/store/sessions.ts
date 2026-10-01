import { execute } from "../db/mysql";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
type Session = { token: string; expiresAt: number };

export async function createSession(): Promise<Session> {
  const session = { token: generateToken(), expiresAt: Date.now() + SESSION_TTL_MS };
  await execute("DELETE FROM sessions WHERE expires_at <= ?", [Date.now()]);
  await execute("INSERT INTO sessions (token, expires_at) VALUES (?, ?)", [
    session.token,
    session.expiresAt,
  ]);
  return session;
}

export async function validateSession(token: string): Promise<boolean> {
  if (!token) return false;
  const result = await execute(
    "UPDATE sessions SET expires_at = expires_at WHERE token = ? AND expires_at > ?",
    [token, Date.now()],
  );
  return result.affectedRows > 0;
}

export async function deleteSession(token: string): Promise<void> {
  await execute("DELETE FROM sessions WHERE token = ?", [token]);
}

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
