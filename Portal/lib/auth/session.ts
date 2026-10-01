import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, deleteSession, validateSession } from "../store/sessions";

const SESSION_COOKIE = "vireon_admin_session";
const ADMIN_LOGIN_PATH = "/admin/login";
const isProduction = process.env.NODE_ENV === "production";

export async function getAdminSessionToken(): Promise<string | null> {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie");
  return cookieHeader ? parseCookie(cookieHeader, SESSION_COOKIE) : null;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminSessionToken();
  return token ? validateSession(token) : false;
}

// Mirrors requireChatGPTUser in app/chatgpt-auth.ts: server components call
// this and let it redirect anonymous/expired visitors to the login page.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect(ADMIN_LOGIN_PATH);
  }
}

export async function startAdminSession(): Promise<string> {
  const session = await createSession();
  return buildSessionCookie(session.token, session.expiresAt);
}

export async function endAdminSession(): Promise<string> {
  const token = await getAdminSessionToken();
  if (token) await deleteSession(token);
  return buildExpiredCookie();
}

function buildSessionCookie(token: string, expiresAt: number): string {
  const maxAgeSeconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  const secure = isProduction ? " Secure;" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function buildExpiredCookie(): string {
  const secure = isProduction ? " Secure;" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=0`;
}

function parseCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = part.slice(0, separatorIndex).trim();
    if (key === name) return decodeURIComponent(part.slice(separatorIndex + 1).trim());
  }
  return null;
}
