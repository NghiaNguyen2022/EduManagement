import { access, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const author = "Nhóm phát triển QLTruongHoc";
const updatedAt = "28/07/2026";

async function listMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function toAnchor(title) {
  return title
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~]/g, "")
    .toLocaleLowerCase("vi")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeDocument(content, version) {
  const lines = content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""));
  const titleIndex = lines.findIndex((line) => /^# [^#]/.test(line));

  if (titleIndex < 0) {
    return content;
  }

  const metadataExists = lines.some((line) => line.startsWith("**Tác giả:**"));
  if (!metadataExists) {
    lines.splice(
      titleIndex + 1,
      0,
      "",
      `**Tác giả:** ${author}`,
      `**Phiên bản:** ${version}`,
      `**Cập nhật:** ${updatedAt}`,
    );
  }

  const headings = lines
    .filter((line) => /^## [^#]/.test(line))
    .map((line) => line.slice(3).trim())
    .filter((title) => title !== "Mục lục");
  const tocIndex = lines.findIndex((line) => line.trim() === "## Mục lục");

  if (headings.length > 0) {
    const tocItems = headings.map((title) => `- [${title}](#${toAnchor(title)})`);

    if (tocIndex < 0) {
      const metadataEnd = lines.findIndex((line, index) =>
        index > titleIndex && line.startsWith("**Cập nhật:**"));
      const insertAt = metadataEnd >= 0 ? metadataEnd + 1 : titleIndex + 1;
      const toc = [
        "",
        "## Mục lục",
        "",
        ...tocItems,
      ];
      lines.splice(insertAt, 0, ...toc);
    } else {
      let tocContentEnd = tocIndex + 1;
      while (
        tocContentEnd < lines.length &&
        (lines[tocContentEnd].trim() === "" || lines[tocContentEnd].startsWith("- ["))
      ) {
        tocContentEnd += 1;
      }
      lines.splice(tocIndex + 1, tocContentEnd - tocIndex - 1, "", ...tocItems, "");
    }
  }

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

const files = [
  path.join(root, "README.md"),
  path.join(root, "PROJECT_SUMMARY.md"),
  ...await listMarkdownFiles(path.join(root, "docs")),
];

const changed = [];
const brokenLinks = [];
for (const file of files) {
  const current = await readFile(file, "utf8");
  const version = path.basename(file) === "README.md" && path.dirname(file) === root
    ? "0.4.0"
    : "1.0";
  const normalized = normalizeDocument(current, version);

  if (normalized !== current.replace(/\r\n/g, "\n")) {
    changed.push(path.relative(root, file));
    if (!checkOnly) {
      await writeFile(file, normalized, "utf8");
    }
  }

  const contentForLinks = checkOnly ? current : normalized;
  for (const match of contentForLinks.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, "");
    if (
      target.startsWith("#") ||
      /^(https?:|mailto:)/i.test(target)
    ) {
      continue;
    }

    const fileTarget = decodeURIComponent(target.split("#")[0]);
    if (!fileTarget) continue;

    try {
      await access(path.resolve(path.dirname(file), fileTarget));
    } catch {
      brokenLinks.push(
        `${path.relative(root, file)} -> ${target}`,
      );
    }
  }
}

if (checkOnly && (changed.length > 0 || brokenLinks.length > 0)) {
  if (changed.length > 0) {
    console.error(`Tài liệu chưa chuẩn hóa:\n- ${changed.join("\n- ")}`);
  }
  if (brokenLinks.length > 0) {
    console.error(`Liên kết nội bộ không tồn tại:\n- ${brokenLinks.join("\n- ")}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    changed.length === 0
      ? "Tất cả tài liệu đã đúng định dạng."
      : `Đã chuẩn hóa ${changed.length} tài liệu.`,
  );
  if (brokenLinks.length > 0) {
    console.warn(`Có ${brokenLinks.length} liên kết nội bộ không tồn tại.`);
  }
}
