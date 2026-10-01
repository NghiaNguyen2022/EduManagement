function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Deliberately not a full markdown implementation: short posts only need
// bold/italic/links/paragraphs. Input is escaped first, so any stray
// HTML/script the author types renders as text instead of executing.
export function renderMarkdownLite(source: string): string {
  const paragraphs = source
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => escapeHtml(paragraph.trim()))
    .filter(Boolean);

  return paragraphs
    .map((paragraph) => {
      let html = paragraph.replace(/\n/g, "<br />");
      html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
      html = html.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      );
      return `<p>${html}</p>`;
    })
    .join("\n");
}

export function toPlainExcerpt(source: string, maxLength = 180): string {
  const plain = source
    .replace(/\[([^\]]+)\]\(https?:\/\/[^\s)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > maxLength ? `${plain.slice(0, maxLength - 1).trim()}…` : plain;
}
