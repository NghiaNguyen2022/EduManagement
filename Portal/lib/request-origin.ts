import { SITE_URL } from "./site-config";

export function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  try {
    const parsed = new URL(origin);
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.origin !== origin
    )
      return false;
    // Next.js can use its bind address in request.url behind a reverse proxy.
    return (
      origin === new URL(SITE_URL).origin ||
      origin === new URL(request.url).origin ||
      parsed.host === request.headers.get("host")
    );
  } catch {
    return false;
  }
}
