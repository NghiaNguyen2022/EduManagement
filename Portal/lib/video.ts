// Converts a YouTube/Vimeo watch/share URL into its embeddable iframe URL.
// Returns null for unrecognized hosts so callers can fall back to a plain link.
export function toEmbedUrl(rawUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtube.com") {
    const videoId = parsed.searchParams.get("v");
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;

    const shortsMatch = parsed.pathname.match(/^\/shorts\/([\w-]+)/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

    const embedMatch = parsed.pathname.match(/^\/embed\/([\w-]+)/);
    if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;

    return null;
  }

  if (host === "youtu.be") {
    const videoId = parsed.pathname.slice(1);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  if (host === "vimeo.com") {
    const videoId = parsed.pathname.split("/").filter(Boolean)[0];
    return videoId && /^\d+$/.test(videoId) ? `https://player.vimeo.com/video/${videoId}` : null;
  }

  return null;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
