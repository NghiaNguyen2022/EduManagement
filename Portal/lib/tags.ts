export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const part of raw.split(",")) {
    const tag = part.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }

  return tags;
}
